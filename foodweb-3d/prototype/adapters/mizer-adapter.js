/*
 * L2 ↔ mizer 适配器 / L2 ↔ mizer adapter
 * 证明 L2 交换格式跨"结构不同的引擎范式"仍适用:与体型谱模型 mizer
 * (Scott, Blanchard & Andersen 2014, MEE 5:1121) 互操作。
 *
 * mizer 以体型(w_inf/w_mat)刻画物种,与 Ecopath 的生物量-食性范式正交——
 * 两个适配器同时工作即"模型无关"的强证明。
 *
 * 产出 mizer 原生输入:species_params.csv + interaction.csv,可直接:
 *   sp <- read.csv("species_params.csv"); int <- as.matrix(read.csv("interaction.csv",row.names=1))
 *   params <- newMultispeciesParams(sp, interaction = int)
 *
 * 仅纳入具 w_inf 的功能组(鱼类);体型谱不表达浮游/底栖非鱼组。
 *
 * 用法: node mizer-adapter.js export ../data/foodweb-yangtze.json out/
 */
'use strict';
const fs = require('fs');
const path = require('path');

function fishGroups(l2) { return l2.groups.filter(g => g.w_inf != null); }

// ---- L2 -> mizer native inputs ---------------------------------------------
function l2ToMizer(l2) {
  const fish = fishGroups(l2);
  const ids = fish.map(g => g.id);

  // species_params.csv
  const cols = ['species', 'w_inf', 'w_mat', 'beta', 'sigma', 'biomass_observed'];
  const rows = [cols.join(',')];
  fish.forEach(g => {
    rows.push([g.id, g.w_inf, g.w_mat, 100, 1.3, g.B0].join(','));
  });
  const speciesParams = rows.join('\n') + '\n';

  // interaction.csv: predator (rows) × prey (cols), 1 where a fish–fish diet link
  // exists in L2, else a low baseline (mizer expects 0..1 preference weights).
  const header = [''].concat(ids).join(',');
  const irows = [header];
  fish.forEach(pred => {
    const d = l2.diet[pred.id] || {};
    const line = [pred.id].concat(ids.map(preyId => (d[preyId] != null ? 1 : 0.2)));
    irows.push(line.join(','));
  });
  const interaction = irows.join('\n') + '\n';

  return { speciesParams, interaction };
}

// ---- mizer native inputs -> L2 (partial) -----------------------------------
function mizerToL2(speciesCsv, interactionCsv) {
  const sp = parseCsv(speciesCsv);
  const groups = sp.rows.map(r => ({
    id: r.species,
    w_inf: +r.w_inf, w_mat: +r.w_mat,
    B0: r.biomass_observed != null && r.biomass_observed !== '' ? +r.biomass_observed : undefined
  }));
  // reconstruct fish–fish diet links from the interaction matrix (1 => link)
  const im = parseCsv(interactionCsv);
  const preyIds = im.header.slice(1);
  const diet = {};
  im.rows.forEach(r => {
    const pred = r[im.header[0]] || r[''] || r.Group || Object.values(r)[0];
    diet[pred] = {};
    preyIds.forEach(prey => { if (+r[prey] >= 0.999) diet[pred][prey] = 1; });
  });
  return { groups, diet };
}

function parseCsv(txt) {
  const lines = txt.trim().split(/\r?\n/);
  const header = lines[0].split(',');
  const rows = lines.slice(1).map(l => {
    const cells = l.split(','); const o = {};
    header.forEach((h, i) => { o[h] = cells[i]; });
    return o;
  });
  return { header, rows };
}

module.exports = { l2ToMizer, mizerToL2, fishGroups };

// ---- CLI ----
if (require.main === module) {
  const [cmd, inFile, outDir] = process.argv.slice(2);
  if (cmd === 'export') {
    const l2 = JSON.parse(fs.readFileSync(inFile, 'utf8'));
    const out = outDir || 'out/';
    fs.mkdirSync(out, { recursive: true });
    const { speciesParams, interaction } = l2ToMizer(l2);
    fs.writeFileSync(path.join(out, 'mizer_species_params.csv'), speciesParams);
    fs.writeFileSync(path.join(out, 'mizer_interaction.csv'), interaction);
    console.log('wrote mizer_species_params.csv and mizer_interaction.csv (' +
      fishGroups(l2).length + ' fish species)');
    console.log('load in R:  newMultispeciesParams(read.csv("mizer_species_params.csv"), ' +
      'interaction=as.matrix(read.csv("mizer_interaction.csv",row.names=1)))');
  } else {
    console.log('usage: node mizer-adapter.js export <l2.json> <outDir>');
  }
}
