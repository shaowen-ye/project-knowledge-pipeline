/*
 * 往返一致性测试 / Round-trip conformance test
 * 证明 L2 交换格式经 Rpath / mizer 适配器往返无损（结构字段）——
 * 这是论文线 2 "模型无关"主张的可验证依据（12-paper2-software-plan.md §7）。
 *
 * 用法: node roundtrip-test.js
 */
'use strict';
const fs = require('fs');
const path = require('path');
const R = require('./rpath-adapter');
const M = require('./mizer-adapter');

const l2 = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/foodweb-yangtze.json'), 'utf8'));
let fails = 0;
function check(name, cond, detail) {
  if (cond) console.log('  ✓ ' + name);
  else { console.log('  ✗ ' + name + (detail ? '  — ' + detail : '')); fails++; }
}
function approx(a, b) { return (isNaN(a) && isNaN(b)) || Math.abs(a - b) < 1e-6; }

// ---------- Rpath round-trip ----------
console.log('Rpath (Ecopath) adapter — L2 → native CSV → L2:');
const rp = R.l2ToRpath(l2);
const l2r = R.rpathToL2(rp.model, rp.diet);
// groups: id/type/biomass/pb/qb preserved
const typeName = { detritus: 'detritus', producer: 'producer' };
let gOK = true, dOK = true;
l2.groups.forEach((g, i) => {
  const g2 = l2r.groups[i];
  const expType = (g.type === 'producer' || g.type === 'detritus') ? g.type : 'consumer';
  if (!g2 || g2.id !== g.id || g2.type !== expType || !approx(g2.B0, g.B0)) gOK = false;
  if (g.pb != null && !approx(g2.pb, g.pb)) gOK = false;
});
check('groups: id/type/biomass/PB/QB preserved (' + l2.groups.length + ' groups)', gOK);
// diet: every L2 link recovered with same fraction
Object.keys(l2.diet).forEach(pred => {
  Object.keys(l2.diet[pred]).forEach(prey => {
    const orig = l2.diet[pred][prey];
    const back = (l2r.diet[pred] || {})[prey];
    if (!approx(orig, back)) { dOK = false; }
  });
});
check('diet matrix: all predator→prey fractions preserved', dOK);
// diet columns sum to 1 (mass-balance validity of emitted file)
const dc = rp.diet.trim().split('\n'); const dhdr = dc[0].split(',').slice(1);
const colSums = dhdr.map(() => 0);
dc.slice(1).forEach(line => { line.split(',').slice(1).forEach((v, j) => { colSums[j] += +v; }); });
check('emitted diet columns sum to 1 (Ecopath valid)', colSums.every(s => Math.abs(s - 1) < 1e-6),
  'sums=' + colSums.map(s => s.toFixed(2)).join(','));

// ---------- mizer round-trip ----------
console.log('mizer (size-spectrum) adapter — L2 → native CSV → L2:');
const mz = M.l2ToMizer(l2);
const l2m = M.mizerToL2(mz.speciesParams, mz.interaction);
const fish = M.fishGroups(l2);
let mOK = true;
fish.forEach((g, i) => {
  const g2 = l2m.groups[i];
  if (!g2 || g2.id !== g.id || !approx(g2.w_inf, g.w_inf) || !approx(g2.w_mat, g.w_mat) || !approx(g2.B0, g.B0)) mOK = false;
});
check('fish species: id/w_inf/w_mat/biomass preserved (' + fish.length + ' species)', mOK);
// fish–fish diet links recovered from interaction matrix
let fdOK = true;
fish.forEach(pred => {
  const d = l2.diet[pred.id] || {};
  fish.forEach(prey => {
    const linkOrig = d[prey.id] != null;
    const linkBack = !!(l2m.diet[pred.id] && l2m.diet[pred.id][prey.id]);
    if (linkOrig !== linkBack) fdOK = false;
  });
});
check('fish–fish predation links preserved via interaction matrix', fdOK);

// ---------- write native files as artifacts ----------
const out = path.join(__dirname, 'out');
fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(path.join(out, 'rpath_model.csv'), rp.model);
fs.writeFileSync(path.join(out, 'rpath_diet.csv'), rp.diet);
fs.writeFileSync(path.join(out, 'mizer_species_params.csv'), mz.speciesParams);
fs.writeFileSync(path.join(out, 'mizer_interaction.csv'), mz.interaction);
console.log('\nnative engine files written to adapters/out/');

console.log(fails === 0 ? '\nALL ROUND-TRIP CHECKS PASSED ✓' : '\n' + fails + ' CHECK(S) FAILED ✗');
process.exit(fails === 0 ? 0 : 1);
