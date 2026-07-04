window.FOODWEB_DATA = {
  "meta": {
    "title_zh": "长江 3-patch 元生态系统食物网（示意）",
    "title_en": "Yangtze 3-patch meta-ecosystem food web (illustrative)",
    "note_zh": "合成/示意数据，量级参照文献，非实测。演示 L2 交换格式。",
    "note_en": "Synthetic illustrative data (orders of magnitude from literature), not measured. Demonstrates the L2 interchange schema.",
    "schema_version": "0.1",
    "months": 120,
    "engine": {
      "gain": 0.11,
      "loss": 0.30,
      "selfDampProducer": 0.9,
      "selfDampConsumer": 0.20,
      "assimilation": 0.6,
      "dt": 0.05
    }
  },
  "patches": [
    { "id": "river", "name_zh": "上游河段", "name_en": "Upstream river reach", "x": -1 },
    { "id": "reservoir", "name_zh": "三峡库区", "name_en": "Reservoir (impoundment)", "x": 0 },
    { "id": "lake", "name_zh": "通江湖泊", "name_en": "Floodplain lake", "x": 1 }
  ],
  "groups": [
    { "id": "detritus",   "name_zh": "碎屑",     "name_en": "Detritus",         "tl": 1.0, "patch": "reservoir", "B0": 40, "cv": 0.30, "type": "detritus" },
    { "id": "phyto",      "name_zh": "浮游植物", "name_en": "Phytoplankton",    "tl": 1.0, "patch": "reservoir", "B0": 30, "cv": 0.25, "type": "producer" },
    { "id": "macrophyte", "name_zh": "水生植物", "name_en": "Macrophytes",      "tl": 1.0, "patch": "lake",      "B0": 20, "cv": 0.30, "type": "producer" },
    { "id": "periphyton", "name_zh": "着生藻",   "name_en": "Periphyton",       "tl": 1.0, "patch": "river",     "B0": 8,  "cv": 0.35, "type": "producer" },
    { "id": "zooplankton","name_zh": "浮游动物", "name_en": "Zooplankton",      "tl": 2.0, "patch": "reservoir", "B0": 14, "cv": 0.30, "type": "consumer" },
    { "id": "zoobenthos", "name_zh": "底栖动物", "name_en": "Zoobenthos",       "tl": 2.1, "patch": "lake",      "B0": 12, "cv": 0.30, "type": "consumer" },
    { "id": "mollusc",    "name_zh": "软体动物", "name_en": "Molluscs",         "tl": 2.0, "patch": "lake",      "B0": 10, "cv": 0.30, "type": "consumer" },
    { "id": "shrimp",     "name_zh": "虾类",     "name_en": "Shrimp",           "tl": 2.3, "patch": "river",     "B0": 6,  "cv": 0.35, "type": "consumer" },
    { "id": "silvercarp", "name_zh": "鲢",       "name_en": "Silver carp",      "tl": 2.2, "patch": "reservoir", "B0": 18, "cv": 0.30, "type": "planktivore", "fished": 0.35, "carp4": true },
    { "id": "bighead",    "name_zh": "鳙",       "name_en": "Bighead carp",     "tl": 2.6, "patch": "reservoir", "B0": 12, "cv": 0.30, "type": "planktivore", "fished": 0.35, "carp4": true },
    { "id": "grasscarp",  "name_zh": "草鱼",     "name_en": "Grass carp",       "tl": 2.1, "patch": "lake",      "B0": 8,  "cv": 0.30, "type": "herbivore",   "fished": 0.40, "carp4": true },
    { "id": "crucian",    "name_zh": "鲤鲫",     "name_en": "Carp/crucian",     "tl": 2.7, "patch": "lake",      "B0": 10, "cv": 0.30, "type": "omnivore",    "fished": 0.45 },
    { "id": "bream",      "name_zh": "鲂",       "name_en": "Bream",            "tl": 2.5, "patch": "reservoir", "B0": 6,  "cv": 0.35, "type": "omnivore",    "fished": 0.40, "carp4": true },
    { "id": "culter",     "name_zh": "翘嘴鲌",   "name_en": "Culter (predatory)","tl": 3.5,"patch": "reservoir", "B0": 4,  "cv": 0.40, "type": "predator",    "fished": 0.70 },
    { "id": "mandarin",   "name_zh": "鳜",       "name_en": "Mandarin fish",    "tl": 3.6, "patch": "lake",      "B0": 3,  "cv": 0.40, "type": "predator",    "fished": 0.65 },
    { "id": "catfish",    "name_zh": "鲇",       "name_en": "Catfish",          "tl": 3.4, "patch": "river",     "B0": 3,  "cv": 0.40, "type": "predator",    "fished": 0.60 },
    { "id": "sturgeon",   "name_zh": "中华鲟",   "name_en": "Chinese sturgeon", "tl": 3.8, "patch": "river",     "B0": 1.2,"cv": 0.50, "type": "apex", "fished": 0.30 },
    { "id": "waterbird",  "name_zh": "水鸟",     "name_en": "Waterbirds",       "tl": 3.9, "patch": "lake",      "B0": 0.8,"cv": 0.50, "type": "apex" }
  ],
  "diet": {
    "zooplankton": { "phyto": 0.8, "detritus": 0.2 },
    "zoobenthos":  { "detritus": 0.6, "phyto": 0.2, "periphyton": 0.2 },
    "mollusc":     { "phyto": 0.5, "detritus": 0.5 },
    "shrimp":      { "detritus": 0.4, "periphyton": 0.3, "zooplankton": 0.3 },
    "silvercarp":  { "phyto": 0.7, "zooplankton": 0.3 },
    "bighead":     { "zooplankton": 0.7, "phyto": 0.3 },
    "grasscarp":   { "macrophyte": 0.8, "periphyton": 0.2 },
    "crucian":     { "detritus": 0.3, "zoobenthos": 0.3, "mollusc": 0.2, "zooplankton": 0.2 },
    "bream":       { "zoobenthos": 0.5, "detritus": 0.3, "periphyton": 0.2 },
    "culter":      { "silvercarp": 0.2, "bighead": 0.2, "bream": 0.3, "shrimp": 0.3 },
    "mandarin":    { "crucian": 0.4, "bream": 0.3, "shrimp": 0.3 },
    "catfish":     { "shrimp": 0.3, "crucian": 0.3, "zoobenthos": 0.2, "mollusc": 0.2 },
    "sturgeon":    { "zoobenthos": 0.4, "mollusc": 0.3, "shrimp": 0.3 },
    "waterbird":   { "crucian": 0.3, "bream": 0.3, "culter": 0.2, "mandarin": 0.2 }
  },
  "inter_edges": [
    { "source_patch": "river", "target_patch": "reservoir", "group": "detritus",   "type_zh": "纵向漂流",     "type_en": "longitudinal drift",     "magnitude": 0.6 },
    { "source_patch": "reservoir", "target_patch": "lake",   "group": "phyto",      "type_zh": "纵向漂流",     "type_en": "longitudinal drift",     "magnitude": 0.5 },
    { "source_patch": "reservoir", "target_patch": "lake",   "group": "silvercarp", "type_zh": "仔稚鱼漂流",   "type_en": "larval drift export",    "magnitude": 0.4 },
    { "source_patch": "lake", "target_patch": "river",       "group": "grasscarp",  "type_zh": "产卵洄游",     "type_en": "spawning migration",     "magnitude": 0.35 },
    { "source_patch": "lake", "target_patch": "river",       "group": "sturgeon",   "type_zh": "产卵洄游",     "type_en": "spawning migration",     "magnitude": 0.3 },
    { "source_patch": "river", "target_patch": "reservoir",  "group": "periphyton", "type_zh": "消落带补给",   "type_en": "drawdown-zone subsidy",  "magnitude": 0.3 }
  ],
  "scenarios": [
    { "id": "baseline", "name_zh": "基线", "name_en": "Baseline",
      "desc_zh": "现状捕捞压力，无干预。", "desc_en": "Status-quo fishing, no intervention." },
    { "id": "ban", "name_zh": "十年禁渔", "name_en": "10-year fishing ban",
      "desc_zh": "捕捞死亡率→0，大型鱼与捕食者回升，向下级联。", "desc_en": "F→0; large fish & predators recover, cascade downward.",
      "removeFishing": true },
    { "id": "stocking", "name_zh": "增殖放流", "name_en": "Stock enhancement",
      "desc_zh": "持续注入鲢鳙；容量约束下总生物量未必等比上升（间接负效应）。", "desc_en": "Sustained silver/bighead injection; carrying-capacity limits net gain (indirect negative effects).",
      "stocking": { "silvercarp": 3.0, "bighead": 2.0 } },
    { "id": "dispatch", "name_zh": "生态调度", "name_en": "Ecological dispatch",
      "desc_zh": "春季人工洪峰→四大家鱼补充脉冲。", "desc_en": "Spring flood pulse → recruitment pulse for the four major carps.",
      "spawnPulse": { "amp": 0.55, "peakMonth": 4, "carp4": true } },
    { "id": "warming", "name_zh": "气候增温", "name_en": "Climate warming",
      "desc_zh": "物候前移，产卵信号与固定调度错配→补充收益被抵消；浮游机制转换。", "desc_en": "Phenology advance; spawning cue decouples from fixed dispatch → recruitment benefit cancelled; plankton regime shift.",
      "spawnPulse": { "amp": 0.55, "peakMonth": 4, "carp4": true }, "phenologyShiftMonths": 2, "planktonPress": -0.10 },
    { "id": "invasion", "name_zh": "外来种入侵", "name_en": "Invasive species",
      "desc_zh": "引种银鱼与浮游动物/鲢竞争，能量传递效率下降，网络脆弱化。", "desc_en": "Introduced icefish competes with zooplankton/silver carp; transfer efficiency drops, web simplifies.",
      "press": { "zooplankton": -0.14, "silvercarp": -0.10 } }
  ]
};
