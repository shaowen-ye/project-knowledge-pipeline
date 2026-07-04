/*
 * 测试套件 / Test suite — foodweb-3d framework
 * 供 CI 运行（node tests/run.js）。覆盖:
 *   1) L1 引擎稳定性（各情景有界/非负）
 *   2) L2 JSON Schema 校验 + 食性守恒
 *   3) Rpath / mizer 适配器往返无损（模型无关证明）
 *   4) 理论模块相图三区俱全（论文线 1）
 * 任一失败 → 退出码 1。
 */
'use strict';
var fs = require('fs');
var path = require('path');
var root = path.join(__dirname, '..');

var E = require(path.join(root, 'src/engine.js'));
var R = require(path.join(root, 'adapters/rpath-adapter.js'));
var Mz = require(path.join(root, 'adapters/mizer-adapter.js'));
var MetaEco = require(path.join(root, 'theory/metaecosystem.js'));
var CF = require(path.join(root, 'theory/closed-form.js'));
var data = JSON.parse(fs.readFileSync(path.join(root, 'data/foodweb-yangtze.json'), 'utf8'));

var fails = 0, n = 0;
function ok(name, cond, detail) { n++; if (cond) console.log('  ✓ ' + name); else { console.log('  ✗ ' + name + (detail ? ' — ' + detail : '')); fails++; } }
function approx(a, b) { return (isNaN(a) && isNaN(b)) || Math.abs(a - b) < 1e-6; }

// 1) engine stability
console.log('L1 engine stability:');
var model = E.buildModel(data);
var stable = true;
data.scenarios.forEach(function (s) {
  var r = E.simulate(model, s.id);
  if (r.frames.some(function (f) { return f.B.some(function (b) { return !isFinite(b) || b < 0; }); })) stable = false;
});
ok('all ' + data.scenarios.length + ' scenarios finite & non-negative', stable);
ok('baseline bounded: total biomass stays within [0.6, 1.6]x initial (no blow-up/collapse)', (function () {
  var B0tot = model.B0.reduce(function (a, b) { return a + b; }, 0), lo = Infinity, hi = 0;
  E.simulate(model, 'baseline').frames.forEach(function (f) {
    var t = f.B.reduce(function (a, b) { return a + b; }, 0); lo = Math.min(lo, t); hi = Math.max(hi, t);
  });
  return lo > 0.6 * B0tot && hi < 1.6 * B0tot;
})());

// 2) schema validation + diet conservation
console.log('L2 schema & conservation:');
try {
  var Ajv = require('ajv');
  var schema = JSON.parse(fs.readFileSync(path.join(root, 'data/l2-schema.json'), 'utf8'));
  var validate = new Ajv({ allErrors: true, strict: false }).compile(schema);
  ok('data validates against l2-schema.json', validate(data), JSON.stringify((validate.errors || []).slice(0, 2)));
} catch (e) {
  console.log('  ! ajv not installed — skipping schema validation (' + e.message + ')');
}
var dietBad = [];
Object.keys(data.diet).forEach(function (p) {
  var s = Object.values(data.diet[p]).reduce(function (a, b) { return a + b; }, 0);
  if (Math.abs(s - 1) > 0.01) dietBad.push(p);
});
ok('diet fractions sum to 1 per predator', dietBad.length === 0, dietBad.join(','));

// 3) adapter round-trips
console.log('Interoperability (model-agnostic L2):');
var rp = R.l2ToRpath(data), l2r = R.rpathToL2(rp.model, rp.diet);
var gOK = data.groups.every(function (g, i) {
  var g2 = l2r.groups[i], et = (g.type === 'producer' || g.type === 'detritus') ? g.type : 'consumer';
  return g2 && g2.id === g.id && g2.type === et && approx(g2.B0, g.B0);
});
ok('Rpath round-trip: groups id/type/biomass preserved', gOK);
var dOK = true;
Object.keys(data.diet).forEach(function (pred) {
  Object.keys(data.diet[pred]).forEach(function (prey) { if (!approx(data.diet[pred][prey], (l2r.diet[pred] || {})[prey])) dOK = false; });
});
ok('Rpath round-trip: diet fractions preserved', dOK);
var mz = Mz.l2ToMizer(data), l2m = Mz.mizerToL2(mz.speciesParams, mz.interaction);
var fish = Mz.fishGroups(data);
ok('mizer round-trip: fish w_inf/w_mat/biomass preserved (' + fish.length + ')', fish.every(function (g, i) {
  var g2 = l2m.groups[i]; return g2 && g2.id === g.id && approx(g2.w_inf, g.w_inf) && approx(g2.w_mat, g.w_mat) && approx(g2.B0, g.B0);
}));

// 4) theory module: phase diagram contains all three regimes
console.log('Theory module (line 1):');
var prm = MetaEco.defaults(), seen = {};
[0.5, 1.0, 1.6, 2.0].forEach(function (a) { [0.0, 0.5, 1.0, 1.4].forEach(function (s) { var r = MetaEco.regime(prm, a, s); if (r && !r.degenerate) seen[r.regime] = 1; }); });
ok('phase diagram exhibits top-down / wasp-waist / bottom-up', seen['top-down'] && seen['wasp-waist'] && seen['bottom-up'], 'seen=' + Object.keys(seen).join(','));
var cfOK = [0.6, 1.05, 1.6, 2.0].every(function (a) {
  var cf = CF.closedForm(prm, a), x = MetaEco.equilibrium(prm, a, 0), i = MetaEco.idx, g = MetaEco.guilds;
  return approx1(cf.A, x[i(prm.focal, g.A)]) && approx1(cf.H, x[i(prm.focal, g.H)]) && approx1(cf.F, x[i(prm.focal, g.F)]) && approx1(cf.P, x[i(prm.focal, g.P)]);
});
function approx1(a, b) { return Math.abs(a - b) / Math.max(Math.abs(b), 1e-9) < 1e-3; }
ok('closed-form equilibrium matches numerical at sigma=0 (exact)', cfOK);

console.log('\n' + (fails === 0 ? 'ALL ' + n + ' TESTS PASSED ✓' : fails + '/' + n + ' TEST(S) FAILED ✗'));
process.exit(fails === 0 ? 0 : 1);
