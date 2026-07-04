/*
 * L2 ↔ Rpath 适配器 / L2 ↔ Rpath adapter
 * 证明 L2 交换格式"模型无关":与 Ecopath 的开源重实现 Rpath
 * (Lucey, Gaichas & Aydin 2020, Ecol. Modelling 427:109057) 互操作。
 *
 * 产出 Rpath 的原生参数文件格式（read.rpath.params 读取的 model.csv / diet.csv），
 * 并能把它们读回 L2。无需安装 R——生成的 CSV 可直接被 Rpath 载入。
 *
 * Rpath Type 约定: 0=consumer(living), 1=producer, 2=detritus, 3=fleet.
 *
 * 用法 / usage:
 *   node rpath-adapter.js export ../data/foodweb-yangtze.json out/
 *   const A=require('./rpath-adapter'); A.l2ToRpath(l2) -> {model, diet}; A.rpathToL2(model,diet)
 */
'use strict';
const fs = require('fs');
const path = require('path');

function typeCode(g) {
  if (g.type === 'detritus') return 2;
  if (g.type === 'producer') return 1;
  return 0; // all trophic consumers
}

// ---- L2 -> Rpath native CSVs -----------------------------------------------
function l2ToRpath(l2) {
  const groups = l2.groups;
  const ids = groups.map(g => g.id);
  const consumers = groups.filter(g => typeCode(g) === 0).map(g => g.id);
  const detritusIds = groups.filter(g => typeCode(g) === 2).map(g => g.id);

  // ---- model (base parameters) CSV ----
  const cols = ['Group', 'Type', 'Biomass', 'PB', 'QB', 'EE', 'ProdCons',
    'BioAcc', 'Unassim', 'DetInput'].concat(detritusIds);
  const rows = [cols.join(',')];
  groups.forEach(g => {
    const t = typeCode(g);
    const rec = {
      Group: g.id, Type: t, Biomass: num(g.B0),
      PB: num(g.pb), QB: t === 1 ? 'NA' : num(g.qb),
      EE: 'NA',                                   // Ecopath solves for the missing one
      ProdCons: 'NA',
      BioAcc: 0,
      Unassim: t === 0 ? 0.2 : 0,                 // unassimilated fraction
      DetInput: t === 2 ? 0 : 'NA'
    };
    // detrital fate: living groups route detritus to the (single) detritus pool
    const line = cols.map(c => {
      if (c in rec) return rec[c];
      // detritus-pool fate columns
      return t === 2 ? 0 : (detritusIds.length ? +(1 / detritusIds.length).toFixed(4) : 0);
    });
    rows.push(line.join(','));
  });
  const model = rows.join('\n') + '\n';

  // ---- diet composition CSV (rows=prey incl. detritus + Import, cols=consumers) ----
  const dcCols = ['Group'].concat(consumers);
  const dcRows = [dcCols.join(',')];
  ids.forEach(preyId => {
    const line = [preyId].concat(consumers.map(predId => {
      const d = l2.diet[predId];
      return d && d[preyId] != null ? d[preyId] : 0;
    }));
    dcRows.push(line.join(','));
  });
  // Import row (external prey subsidy) — zero here
  dcRows.push(['Import'].concat(consumers.map(() => 0)).join(','));
  const diet = dcRows.join('\n') + '\n';

  return { model, diet };
}

// ---- Rpath native CSVs -> L2 (partial: structure the format carries) -------
function rpathToL2(modelCsv, dietCsv) {
  const m = parseCsv(modelCsv);
  const typeName = { 0: 'consumer', 1: 'producer', 2: 'detritus', 3: 'fleet' };
  const groups = m.rows.map(r => {
    const g = { id: r.Group, type: typeName[+r.Type], B0: n(r.Biomass) };
    if (isNum(r.PB)) g.pb = n(r.PB);
    if (isNum(r.QB)) g.qb = n(r.QB);
    return g;
  });

  const d = parseCsv(dietCsv);
  const predators = d.header.slice(1); // columns after Group
  const diet = {};
  predators.forEach(pred => { diet[pred] = {}; });
  d.rows.forEach(r => {
    const prey = r.Group;
    if (prey === 'Import') return;
    predators.forEach(pred => {
      const v = n(r[pred]);
      if (v > 0) diet[pred][prey] = v;
    });
  });
  return { groups, diet };
}

// ---- helpers ----
function num(v) { return v == null ? 'NA' : v; }
function n(v) { return v === 'NA' || v === '' || v == null ? NaN : +v; }
function isNum(v) { return v !== 'NA' && v !== '' && v != null && isFinite(+v); }
function parseCsv(txt) {
  const lines = txt.trim().split(/\r?\n/);
  const header = lines[0].split(',');
  const rows = lines.slice(1).map(l => {
    const cells = l.split(',');
    const o = {}; header.forEach((h, i) => { o[h] = cells[i]; });
    return o;
  });
  return { header, rows };
}

module.exports = { l2ToRpath, rpathToL2, typeCode };

// ---- CLI ----
if (require.main === module) {
  const [cmd, inFile, outDir] = process.argv.slice(2);
  if (cmd === 'export') {
    const l2 = JSON.parse(fs.readFileSync(inFile, 'utf8'));
    const out = outDir || 'out/';
    fs.mkdirSync(out, { recursive: true });
    const { model, diet } = l2ToRpath(l2);
    fs.writeFileSync(path.join(out, 'rpath_model.csv'), model);
    fs.writeFileSync(path.join(out, 'rpath_diet.csv'), diet);
    console.log('wrote', path.join(out, 'rpath_model.csv'), 'and rpath_diet.csv');
    console.log('load in R:  read.rpath.params("rpath_model.csv","rpath_diet.csv")');
  } else {
    console.log('usage: node rpath-adapter.js export <l2.json> <outDir>');
  }
}
