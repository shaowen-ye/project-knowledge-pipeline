/*
 * 空间控制机制理论模型 / Spatial control-regime meta-ecosystem model
 * (论文线 1 / publication line 1 — 11-paper1-theory-plan.md)
 *
 * 极简正则 meta-生态系统模块（Loreau/Gravel/Massol 风格）:
 * 每 patch 一条 4 层链 A→H→F→P（生产者→植食者→饵料层→捕食者）,
 * patch 沿 河→库→湖 链式连接:下行物质漂流(A) + 消费者扩散(H,F,P),饵料层 F 扩散最强
 * (作空间"闸门")。以 press-perturbation 的**弹性**(dimensionless) 诊断
 * 上行 / 下行 / 蜂腰 控制。
 *
 * 两个可扫描标量: alpha=局域营养互作强度(缩放攻击率); sigma=跨系统补给量(缩放跨-patch 流)。
 * Node + 浏览器双运行。
 */
(function (root) {
  'use strict';

  var NG = 4;                 // guilds per patch
  var A = 0, H = 1, F = 2, P = 3;  // producer, herbivore, forage, predator

  function defaults() {
    return {
      patches: 3,                       // river(0) -> reservoir(1) -> lake(2)
      rA: [1.3, 1.1, 1.0],              // producer intrinsic growth (enrichment gradient)
      K: 12,                            // producer carrying capacity
      e: 0.65,                          // assimilation efficiency
      attack: [0.45, 0.5, 0.30],        // a_AH, a_HF fixed; a_FP scaled by alpha (predation pressure)
      mort: [0, 0.15, 0.12, 0.03],      // A(none), H, F, P; low P demand → persists at low numbers
      selfF: 0.52,                      // forage self-limitation → makes F a flux gate (wasp-waist)
      driftA: 1.3,                      // downstream producer drift (x sigma) → bottom-up subsidy
      disp: [0, 0.10, 0.85, 0.12],      // dispersal per guild; F highest = spatial gate (x sigma)
      focal: 1                          // reservoir
    };
  }
  function idx(p, g) { return p * NG + g; }

  function deriv(x, prm, alpha, sigma) {
    var np = prm.patches, n = np * NG, d = new Array(n).fill(0);
    // alpha = TOP-DOWN control strength: scales the upper (predator-side) attack rates
    // a_HF and a_FP. Lower link a_AH is fixed, so alpha changes the RELATIVE structure
    // (predation pressure) rather than uniformly rescaling everything.
    var aAH = prm.attack[0], aHF = prm.attack[1] * alpha, aFP = prm.attack[2] * alpha;
    for (var p = 0; p < np; p++) {
      var a = x[idx(p, A)], h = x[idx(p, H)], f = x[idx(p, F)], pr = x[idx(p, P)];
      var cAH = aAH * h * a, cHF = aHF * f * h, cFP = aFP * pr * f;
      d[idx(p, A)] += prm.rA[p] * a * (1 - a / prm.K) - cAH;
      d[idx(p, H)] += prm.e * cAH - prm.mort[H] * h - cHF;
      d[idx(p, F)] += prm.e * cHF - prm.mort[F] * f - prm.selfF * f * f - cFP;
      d[idx(p, P)] += prm.e * cFP - prm.mort[P] * pr;
    }
    for (var q = 0; q < np - 1; q++) {
      var fa = sigma * prm.driftA * x[idx(q, A)];         // downstream producer drift
      d[idx(q, A)] -= fa; d[idx(q + 1, A)] += fa;
      [H, F, P].forEach(function (g) {                    // bidirectional dispersal
        var net = sigma * prm.disp[g] * (x[idx(q, g)] - x[idx(q + 1, g)]);
        d[idx(q, g)] -= net; d[idx(q + 1, g)] += net;
      });
    }
    return d;
  }

  function equilibrium(prm, alpha, sigma) {
    var n = prm.patches * NG, x = new Array(n).fill(1.5), dt = 0.02, tol = 1e-8;
    for (var s = 0; s < 80000; s++) {
      var k1 = deriv(x, prm, alpha, sigma),
        k2 = deriv(add(x, k1, dt / 2), prm, alpha, sigma),
        k3 = deriv(add(x, k2, dt / 2), prm, alpha, sigma),
        k4 = deriv(add(x, k3, dt), prm, alpha, sigma), mx = 0;
      for (var i = 0; i < n; i++) {
        var dd = (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]) / 6;
        x[i] += dt * dd;
        if (x[i] < 1e-9) x[i] = 1e-9;
        if (!isFinite(x[i]) || x[i] > 1e7) return null;
        mx = Math.max(mx, Math.abs(dd));
      }
      if (mx < tol && s > 300) break;
    }
    return x;
  }
  function add(x, k, h) { return x.map(function (v, i) { return Math.max(v + h * k[i], 1e-9); }); }

  function jacobian(x, prm, alpha, sigma) {
    var n = x.length, eps = 1e-6, J = Array.from({ length: n }, function () { return new Array(n).fill(0); });
    for (var j = 0; j < n; j++) {
      var xp = x.slice(), xm = x.slice(); xp[j] += eps; xm[j] -= eps;
      var fp = deriv(xp, prm, alpha, sigma), fm = deriv(xm, prm, alpha, sigma);
      for (var i = 0; i < n; i++) J[i][j] = (fp[i] - fm[i]) / (2 * eps);
    }
    return J;
  }

  function inverse(M) {
    var n = M.length, Aug = M.map(function (r, i) {
      return r.concat(Array.from({ length: n }, function (_, j) { return i === j ? 1 : 0; }));
    });
    for (var c = 0; c < n; c++) {
      var piv = c;
      for (var r = c + 1; r < n; r++) if (Math.abs(Aug[r][c]) > Math.abs(Aug[piv][c])) piv = r;
      if (Math.abs(Aug[piv][c]) < 1e-12) return null;
      var t = Aug[c]; Aug[c] = Aug[piv]; Aug[piv] = t;
      var pv = Aug[c][c];
      for (var k = 0; k < 2 * n; k++) Aug[c][k] /= pv;
      for (var r2 = 0; r2 < n; r2++) { if (r2 === c) continue; var f = Aug[r2][c];
        for (var k2 = 0; k2 < 2 * n; k2++) Aug[r2][k2] -= f * Aug[c][k2]; }
    }
    return Aug.map(function (r) { return r.slice(n); });
  }

  // Control regime by disposal partition of the pivotal forage layer's production
  // (transparent, flux-based, comparable — the three shares sum to 1):
  //   top-down  = predation share       (predator consumes forage production)
  //   wasp-waist= self-limitation share (density-dependent gate at the waist)
  //   bottom-up = throughput share      (mortality + net export; resource-driven pass-through)
  function regime(prm, alpha, sigma) {
    var x = equilibrium(prm, alpha, sigma);
    if (!x) return null;
    var fp = prm.focal, np = prm.patches;
    if (x[idx(fp, P)] < 1e-4 || x[idx(fp, F)] < 1e-4 || x[idx(fp, H)] < 1e-4) return { degenerate: true, x: x };
    var aFP = prm.attack[2] * alpha;
    var f = x[idx(fp, F)], pr = x[idx(fp, P)];

    // per-capita control rates on the pivotal forage layer (all units 1/time, comparable):
    //   top-down  = predator per-capita predation pressure
    //   wasp-waist= density-dependent self-regulation at the waist
    //   bottom-up = baseline turnover + subsidy-driven throughput (cross-system flow)
    var td = aFP * pr;                               // predator control
    var ww = 2 * prm.selfF * f;                      // self-regulation (marginal)
    var bu = prm.mort[F] + sigma * prm.disp[F] * 0.55; // throughput + cross-system subsidy
    var sum = td + ww + bu || 1;
    var frac = { bu: bu / sum, td: td / sum, ww: ww / sum };
    var reg = frac.td >= frac.ww && frac.td >= frac.bu ? 'top-down'
      : (frac.ww >= frac.bu ? 'wasp-waist' : 'bottom-up');
    return { bu: bu, td: td, ww: ww, frac: frac, regime: reg,
      biomass: { A: x[idx(fp, A)], H: x[idx(fp, H)], F: x[idx(fp, F)], P: x[idx(fp, P)] } };
  }

  var api = { defaults: defaults, deriv: deriv, equilibrium: equilibrium, regime: regime,
    idx: idx, guilds: { A: A, H: H, F: F, P: P } };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.MetaEco = api;
})(typeof window !== 'undefined' ? window : this);
