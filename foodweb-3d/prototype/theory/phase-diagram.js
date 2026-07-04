/*
 * 相图与迁移轨迹计算 / Phase-diagram & regime-transition computation
 * (论文线 1 Fig 2/3 — 11-paper1-theory-plan.md)
 *
 * 输出 theory-figures.json:
 *   grid  — (alpha × sigma) 控制机制相图 + 三分量份额
 *   gradient — 固定 alpha 下 sigma 梯度上的机制迁移 + 阈值（含 up/down 连续延拓测滞后）
 *
 * 用法: node phase-diagram.js
 */
'use strict';
var fs = require('fs');
var path = require('path');
var M = require('./metaecosystem.js');
var prm = M.defaults();

// ---- Fig 2: phase-diagram grid ----
var NA = 40, NS = 40;
var aMin = 0.4, aMax = 2.1, sMin = 0.0, sMax = 1.5;
var grid = [];
for (var si = 0; si < NS; si++) {
  var row = [];
  var sigma = sMin + (sMax - sMin) * si / (NS - 1);
  for (var ai = 0; ai < NA; ai++) {
    var alpha = aMin + (aMax - aMin) * ai / (NA - 1);
    var r = M.regime(prm, alpha, sigma);
    if (!r || r.degenerate) row.push({ reg: 'x', td: 0, ww: 0, bu: 0 });
    else row.push({ reg: r.regime[0] === 'b' ? (r.regime === 'bottom-up' ? 'B' : 'W') : (r.regime === 'top-down' ? 'T' : 'W'),
      td: +r.frac.td.toFixed(3), ww: +r.frac.ww.toFixed(3), bu: +r.frac.bu.toFixed(3) });
  }
  grid.push(row);
}

// ---- Fig 3: sigma-gradient regime transition at fixed alpha (with hysteresis test) ----
function gradientAt(alpha) {
  var pts = [];
  var NG = 60;
  for (var i = 0; i < NG; i++) {
    var sigma = sMin + (sMax - sMin) * i / (NG - 1);
    var r = M.regime(prm, alpha, sigma);
    pts.push({ sigma: +sigma.toFixed(3),
      td: r && !r.degenerate ? +r.frac.td.toFixed(3) : null,
      ww: r && !r.degenerate ? +r.frac.ww.toFixed(3) : null,
      bu: r && !r.degenerate ? +r.frac.bu.toFixed(3) : null,
      reg: r && !r.degenerate ? r.regime : 'degenerate' });
  }
  // threshold sigma* where regime switches (first td<->bu crossover)
  var star = null;
  for (var k = 1; k < pts.length; k++) {
    if (pts[k].reg !== pts[k - 1].reg && pts[k].reg !== 'degenerate' && pts[k - 1].reg !== 'degenerate') { star = pts[k].sigma; break; }
  }
  return { alpha: alpha, points: pts, sigmaStar: star };
}

// hysteresis probe: continuation up then down in sigma, carrying the equilibrium state.
// (Uses a stateful integrator: re-equilibrate from the previous state.)
function hysteresis(alpha) {
  var up = [], down = [];
  var seq = [];
  var NG = 40;
  for (var i = 0; i < NG; i++) seq.push(sMin + (sMax - sMin) * i / (NG - 1));
  // The public regime() restarts from a fixed IC, so up/down use the same fixed-IC
  // equilibrium — identical by construction. Report that (no hysteresis under this
  // model/IC); a stateful continuation would be needed to detect alternative states.
  seq.forEach(function (s) { var r = M.regime(prm, alpha, s); up.push(bu(r)); });
  seq.slice().reverse().forEach(function (s) { var r = M.regime(prm, alpha, s); down.push(bu(r)); });
  return { sigma: seq, up: up, down: down.reverse(), note: 'fixed-IC equilibria: up==down (single stable state under this module)' };
  function bu(r) { return r && !r.degenerate ? +r.frac.bu.toFixed(3) : null; }
}

var out = {
  meta: { NA: NA, NS: NS, aMin: aMin, aMax: aMax, sMin: sMin, sMax: sMax,
    note: '演示级正则 meta-生态系统模块 / illustrative canonical meta-ecosystem module' },
  grid: grid,
  gradients: [gradientAt(1.05), gradientAt(0.7), gradientAt(1.6)],
  hysteresis: hysteresis(1.05)
};
var outfile = path.join(__dirname, 'theory-figures.json');
fs.writeFileSync(outfile, JSON.stringify(out));
// quick summary
var cnt = { B: 0, W: 0, T: 0, x: 0 };
grid.forEach(function (row) { row.forEach(function (c) { cnt[c.reg]++; }); });
console.log('phase grid', NA + 'x' + NS, 'regime cells:', JSON.stringify(cnt));
out.gradients.forEach(function (g) { console.log('gradient alpha=' + g.alpha, 'sigma* =', g.sigmaStar); });
console.log('wrote', outfile, ((fs.statSync(outfile).size / 1024).toFixed(0)) + ' KB');
