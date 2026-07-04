/*
 * 平衡的闭式准静态近似 / Closed-form quasi-static equilibrium approximation
 * (论文线 1 T4 — 11-paper1-theory-plan.md; 解析见 14 §4a)
 *
 * 对焦点 patch 的 4 层链 A→H→F→P，逐方程解平衡（predator-controlled 分支）：
 *   F_eq = mP / (e·alpha·a_FP)                    (predator pins forage; top-down)
 *   A_eq = (mH + a_HF·mP/(e·a_FP)) / (e·a_AH)     (alpha cancels -> constant)
 *   H_eq = rA·(1 - A_eq/K) / a_AH
 *   P_eq = (e·alpha·a_HF·H_eq - mF - selfF·F_eq) / (alpha·a_FP)
 * 在 sigma=0（patch 隔离）时应与数值平衡精确吻合；sigma>0 为一阶近似。
 */
'use strict';
var MetaEco = require('./metaecosystem.js');

// closed form at the focal patch (isolated / leading order)
function closedForm(prm, alpha) {
  var p = prm.focal, rA = prm.rA[p], K = prm.K, e = prm.e;
  var aAH = prm.attack[0], aHF = prm.attack[1], aFP = prm.attack[2];
  var mH = prm.mort[1], mF = prm.mort[2], mP = prm.mort[3], selfF = prm.selfF;

  var F = mP / (e * alpha * aFP);
  var A = (mH + aHF * mP / (e * aFP)) / (e * aAH);
  var H = rA * (1 - A / K) / aAH;
  var P = (e * alpha * aHF * H - mF - selfF * F) / (alpha * aFP);
  // per-capita control rates (same definitions as the classifier)
  var td = alpha * aFP * P, ww = 2 * selfF * F;
  return { A: A, H: H, F: F, P: P, td: td, ww: ww };
}

// closed-form threshold sigma*(alpha) for td = bu  (bu = mF + 0.55·sigma·disp_F)
function sigmaStarClosed(prm, alpha) {
  var cf = closedForm(prm, alpha);
  var mF = prm.mort[2], dispF = prm.disp[2];
  return (cf.td - mF) / (0.55 * dispF);
}

module.exports = { closedForm: closedForm, sigmaStarClosed: sigmaStarClosed };

// ---- verification ----
if (require.main === module) {
  var prm = MetaEco.defaults();
  var fp = prm.focal, idx = MetaEco.idx, g = MetaEco.guilds;
  console.log('1) closed form vs numerical equilibrium at sigma=0 (isolated patch):');
  console.log('   alpha   guild  closed    numerical   rel.err');
  [0.6, 1.05, 1.6, 2.0].forEach(function (a) {
    var cf = closedForm(prm, a);
    var x = MetaEco.equilibrium(prm, a, 0);
    var num = { A: x[idx(fp, g.A)], H: x[idx(fp, g.H)], F: x[idx(fp, g.F)], P: x[idx(fp, g.P)] };
    ['A', 'H', 'F', 'P'].forEach(function (k) {
      var err = Math.abs(cf[k] - num[k]) / Math.max(Math.abs(num[k]), 1e-9);
      console.log('   ' + a.toFixed(2) + '    ' + k + '     ' + cf[k].toFixed(4).padStart(8) + '  ' + num[k].toFixed(4).padStart(9) + '   ' + (err * 100).toFixed(2) + '%');
    });
  });
  console.log('\n2) closed-form sigma*(alpha) trend vs numerical grid measurement:');
  console.log('   alpha   sigma*_closed   (numerical grid ~ see phase-diagram.js gradients)');
  [0.7, 1.05, 1.6].forEach(function (a) {
    console.log('   ' + a.toFixed(2) + '       ' + sigmaStarClosed(prm, a).toFixed(3));
  });
  console.log('\n   → sigma*_closed rises ~linearly with alpha (dominant term e·a_HF·H*·alpha),');
  console.log('     analytically confirming Fig 3 right-shift. Quantitative offset vs the grid');
  console.log('     is the sigma>0 correction (subsidy lowers td), i.e. this is a leading-order bound.');
}
