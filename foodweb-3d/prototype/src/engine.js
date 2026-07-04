/*
 * L1 引擎层 / Engine layer — 轻量生物量动态积分器
 * Lightweight biomass-dynamics integrator (generalized Lotka–Volterra,
 * mass-balanced at t0, driven by scenario press perturbations).
 *
 * 演示级、非科研级校准。构造上把 B0 设为平衡点（Ecopath 思路），
 * 情景以 press / 移民 / 季节脉冲 扰动之，效应经互作矩阵沿食物网传播。
 * Demonstration-grade. B0 is constructed to be an equilibrium; scenarios
 * perturb it and effects propagate through the interaction matrix.
 *
 * Works in the browser (window.FoodwebEngine) and in Node (module.exports).
 */
(function (root) {
  'use strict';

  function buildModel(data) {
    const groups = data.groups;
    const n = groups.length;
    const idx = {};
    groups.forEach((g, i) => { idx[g.id] = i; });

    const B0 = groups.map(g => g.B0);
    const isProducer = groups.map(g => g.type === 'producer' || g.type === 'detritus');

    const p = data.meta.engine;
    // A[i][j] = per-capita effect of group j on group i (GLV).
    const A = Array.from({ length: n }, () => new Array(n).fill(0));

    // self-limitation on the diagonal
    for (let i = 0; i < n; i++) {
      A[i][i] = -(isProducer[i] ? p.selfDampProducer : p.selfDampConsumer);
    }

    // predation links from the diet matrix: predator `pred` eats prey `prey`
    const diet = data.diet || {};
    const links = []; // {pred, prey, frac} for flux computation
    Object.keys(diet).forEach(predId => {
      const i = idx[predId];
      const d = diet[predId];
      Object.keys(d).forEach(preyId => {
        const j = idx[preyId];
        if (i == null || j == null) return;
        const frac = d[preyId];
        // prey j benefits predator i; predator i harms prey j
        A[i][j] += p.gain * frac;
        A[j][i] -= p.loss * frac * (B0[i] / Math.max(B0[j], 1e-6));
        links.push({ pred: i, prey: j, frac: frac });
      });
    });

    // intrinsic growth r chosen so that dB/dt = 0 at B = B0  (equilibrium by construction)
    const r0 = new Array(n).fill(0);
    for (let i = 0; i < n; i++) {
      let s = 0;
      for (let j = 0; j < n; j++) s += A[i][j] * B0[j];
      r0[i] = -s;
    }

    return { data, groups, n, idx, B0, isProducer, A, r0, links, p };
  }

  // Per-scenario forcing applied at simulation time (months, 0-based float)
  function scenarioForcing(model, scen, tMonth) {
    const n = model.n, idx = model.idx, groups = model.groups;
    const dR = new Array(n).fill(0);     // additive press on intrinsic growth
    const immig = new Array(n).fill(0);  // constant immigration (stocking)
    if (!scen) return { dR, immig };

    // fishing: baseline fishing is already folded into r0 via equilibrium.
    // Removing it (ban) adds back the fishing mortality as positive growth.
    if (scen.removeFishing) {
      groups.forEach((g, i) => { if (g.fished) dR[i] += g.fished; });
    }

    // stock enhancement: constant immigration into stocked groups
    if (scen.stocking) {
      Object.keys(scen.stocking).forEach(id => {
        if (idx[id] != null) immig[idx[id]] += scen.stocking[id];
      });
    }

    // ecological dispatch: recruitment gain for the four major carps.
    // The fixed dispatch flood peaks at sp.peakMonth; the biological spawning
    // readiness peaks earlier under warming (phenologyShiftMonths). Effective
    // recruitment = overlap of the two — this is the "spawning-cue × dispatch"
    // coupling that decouples under warming.
    if (scen.spawnPulse) {
      const sp = scen.spawnPulse;
      const shift = scen.phenologyShiftMonths || 0;
      const dispatchPeak = sp.peakMonth % 12;
      const bioPeak = ((sp.peakMonth - shift) % 12 + 12) % 12;
      const overlap = gauss(bioPeak - dispatchPeak, 0, 1.5); // 1 when aligned, ↓ when mistimed
      const sustained = sp.amp * overlap;                    // annual mean recruitment gain
      // small seasonal visual modulation around the sustained gain
      const monthOfYear = tMonth % 12;
      const seasonal = 0.3 * sustained * gauss(monthOfYear, dispatchPeak, 1.1);
      groups.forEach((g, i) => { if (g.carp4) dR[i] += sustained + seasonal; });
    }

    // generic press (e.g. warming plankton regime shift, invasion competition)
    if (scen.planktonPress && idx.zooplankton != null) dR[idx.zooplankton] += scen.planktonPress;
    if (scen.press) {
      Object.keys(scen.press).forEach(id => {
        if (idx[id] != null) dR[idx[id]] += scen.press[id];
      });
    }
    return { dR, immig };
  }

  function gauss(x, mu, sigma) {
    const d = x - mu;
    return Math.exp(-(d * d) / (2 * sigma * sigma));
  }

  // Integrate one scenario; return per-month snapshots of biomass, flux, metrics.
  function simulate(model, scenId) {
    const scen = (model.data.scenarios || []).find(s => s.id === scenId) || null;
    const n = model.n, A = model.A, r0 = model.r0, p = model.p;
    const months = model.data.meta.months;
    const dt = p.dt;
    const steps = Math.round(months / dt);
    const B = model.B0.slice();
    const cap = model.B0.map(b => b * 6 + 5); // upper clamp to keep the demo bounded

    const frames = [];
    let stepInFrame = 0;
    const framesPerMonth = Math.round(1 / dt);

    for (let s = 0; s <= steps; s++) {
      const t = s * dt;
      const f = scenarioForcing(model, scen, t);
      // dB_i = B_i * ( r0_i + dR_i + Σ_j A_ij B_j ) + immig_i
      const dB = new Array(n);
      for (let i = 0; i < n; i++) {
        let interaction = r0[i] + f.dR[i];
        const Ai = A[i];
        for (let j = 0; j < n; j++) interaction += Ai[j] * B[j];
        dB[i] = B[i] * interaction + f.immig[i];
      }
      for (let i = 0; i < n; i++) {
        B[i] += dt * dB[i];
        if (B[i] < 1e-4) B[i] = 1e-4;
        if (B[i] > cap[i]) B[i] = cap[i];
      }

      if (s % framesPerMonth === 0) {
        frames.push(snapshot(model, B, scen, t));
        stepInFrame = 0;
      }
      stepInFrame++;
    }
    return { scenarioId: scenId, months, frames };
  }

  function snapshot(model, B, scen, t) {
    const n = model.n, p = model.p;
    // fluxes on each trophic link: consumption of prey by predator
    const flux = model.links.map(l => {
      return p.assimilation * p.gain * l.frac * B[l.pred] * B[l.prey];
    });
    const tst = flux.reduce((a, b) => a + b, 0);

    // control-mechanism indices (illustrative, normalized later in UI)
    let prodB = 0, apexB = 0, waistB = 0, totB = 0;
    model.groups.forEach((g, i) => {
      totB += B[i];
      if (g.type === 'producer' || g.type === 'detritus') prodB += B[i];
      if (g.type === 'apex' || g.type === 'predator') apexB += B[i];
      if (g.type === 'planktivore' || g.id === 'zooplankton') waistB += B[i];
    });
    // transfer efficiency proxy: apex production supported per unit producer biomass
    const transferEff = apexB / Math.max(prodB, 1e-6);
    // realized connectance: links whose flux is non-negligible / N^2
    const active = flux.filter(x => x > tst * 0.005).length;
    const connectance = active / (n * n);

    return {
      t: t,
      B: B.slice(),
      flux: flux,
      metrics: {
        tst: tst,
        connectance: connectance,
        bottomUp: prodB / Math.max(totB, 1e-6),
        topDown: apexB / Math.max(totB, 1e-6),
        waspWaist: waistB / Math.max(totB, 1e-6),
        transferEff: transferEff,
        totalBiomass: totB
      }
    };
  }

  const api = { buildModel, simulate, scenarioForcing };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.FoodwebEngine = api;
})(typeof window !== 'undefined' ? window : this);
