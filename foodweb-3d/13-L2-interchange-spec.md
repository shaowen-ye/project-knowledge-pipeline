# 13 · L2 交换格式规范 / L2 Interchange Format Specification (v0.3)

> **模型无关的食物网交换格式**——把静态网络 + 动态营养 + 空间补给 + 物理强迫 + 管理情景统一为单一 schema，解锁跨引擎（Ecopath/EwE、Rpath、mizer、LIM、GLM-AED/CE-QUAL-W2）互联、集合分析与共享 3D 渲染（[05](05-gaps-difficulties.md) §8、[06](06-framework-design.md) §3）。本文是论文线 2（[12](12-paper2-software-plan.md)）的 **Fig 2 / 规范附录**，其"模型无关"主张由 §6 的往返测试支撑。

- **规范文件**：[`prototype/data/l2-schema.json`](prototype/data/l2-schema.json)（JSON Schema Draft-07）
- **参考实例**：[`prototype/data/foodweb-yangtze.json`](prototype/data/foodweb-yangtze.json)
- **适配器**：[`prototype/adapters/`](prototype/adapters/)（Rpath、mizer + 往返测试）

---

## 1. 设计原则 / Design principles

1. **模型无关**：只描述"食物网 + 空间 + 物理 + 情景"的**领域语义**，不绑定任一引擎的内部表示；各引擎经适配器读写。
2. **可选而分层**：`meta`+`groups`+`diet` 为必需核心；`patches`/`inter_edges`/`physics`/`scenarios` 为可选层，按需启用。
3. **不确定性就位**：每组带 `cv`；可扩展分布字段（未来）。
4. **人可读、机可校**：JSON + JSON Schema；数值语义显式（单位在字段注释）。
5. **可复现**：一个 JSON 完整定义一个可运行的 meta-生态系统模型实例。

---

## 2. 顶层结构 / Top-level structure

```jsonc
{
  "meta":       { … },      // 必需：版本、时长、引擎参数、来源
  "physics":    { … },      // 可选：物理强迫（水位/水温/耦合系数）
  "patches":    [ … ],      // 可选：空间 patch（meta-生态系统）
  "groups":     [ … ],      // 必需：功能组（节点）
  "diet":       { … },      // 必需：食性矩阵（有向加权边）
  "inter_edges":[ … ],      // 可选：跨-patch 补给/洄游流
  "scenarios":  [ … ]       // 可选：管理情景
}
```

---

## 3. 字段参考 / Field reference

### 3.1 `meta`（必需）
| 字段 | 类型 | 语义 |
|---|---|---|
| `schema_version` | string | 格式版本（当前 `"0.3"`） |
| `months` | int | 模拟时长（月） |
| `engine` | object | 参考引擎参数（gain/loss/dt…；引擎相关，可忽略） |
| `provenance` | object | 数据来源与诚实边界（`forcing_*`/`trophic_*`） |

### 3.2 `groups[]`（必需，节点）
| 字段 | 类型 | 必需 | 语义 |
|---|---|---|---|
| `id` | string | ✓ | 唯一标识 |
| `type` | enum | ✓ | `detritus/producer/consumer/planktivore/herbivore/omnivore/predator/apex` |
| `B0` | number | ✓ | 初始/基线生物量（相对或 t·km⁻²） |
| `name_zh/name_en` | string | | 名称 |
| `tl` | number | | 营养级（渲染 z 轴） |
| `patch` | string | | 所属 patch id |
| `cv` | number | | 生物量不确定性（变异系数） |
| `fished` | number | | 基线捕捞死亡率（情景用） |
| `carp4` | bool | | 是否四大家鱼（调度/补充用） |
| `pb` | number | | **P/B, yr⁻¹（Ecopath）** |
| `qb` | number | | **Q/B, yr⁻¹（Ecopath）** |
| `ee` | number | | 生态营养效率（Ecopath，缺省由 Ecopath 求解） |
| `w_inf` | number | | **渐近体重 g（体型谱/mizer）** |
| `w_mat` | number | | 成熟体重 g（体型谱/mizer） |

> `pb/qb/ee` 服务质量平衡引擎；`w_inf/w_mat` 服务体型谱引擎——**同一 schema 同时承载两种范式的参数**，是"模型无关"的关键设计。

### 3.3 `diet`（必需，有向加权边）
`predator_id → { prey_id → fraction }`；每个捕食者的分数之和应 ≈ 1。能量沿 prey→predator 流动（渲染为向上的粒子流）。

### 3.4 `patches[]`（可选，meta-生态系统空间）
`id`、`name_*`、`x`（纵向位置：河→库→湖）。

### 3.5 `inter_edges[]`（可选，跨系统补给）
`source_patch`、`target_patch`、`group`、`type_zh/en`（漂流/洄游/消落带补给）、`magnitude`。承载 meta-生态系统空间流（[04](04-theory.md) §4–5）。

### 3.6 `physics`（可选，物理强迫）
`waterLevel_m[12]`、`temp_c[12]`（月气候态）、`spawnTempThreshold_c`、`dispatchPeakMonth`、`coupling{…}`。驱动物理↔营养双向耦合（[09](09-phase2-coupling.md)）。

### 3.7 `scenarios[]`（可选，管理情景）
`id`、`name_*`、`removeFishing`、`stocking{}`、`dispatch`、`adaptiveDispatch`、`tempDelta`、`press{}`。

---

## 4. 版本与兼容 / Versioning
- `meta.schema_version` 语义化。当前 **0.3**（0.1 核心网络 → 0.2 加物理/来源 → 0.3 加引擎参数 pb/qb/w_inf）。
- 向后兼容策略：新增字段为可选；破坏性变更升 minor/major 并在本文记录。

---

## 5. 引擎映射 / Engine mappings

### 5.1 L2 ↔ Rpath（Ecopath 质量平衡）
| L2 | Rpath model.csv | 说明 |
|---|---|---|
| `type` | `Type` | detritus→2, producer→1, 其余→0(consumer) |
| `B0` | `Biomass` | |
| `pb`/`qb` | `PB`/`QB` | producer 的 QB=NA |
| （缺省） | `EE` | =NA → **Ecopath 求解**（Ecopath 设计） |
| `diet` | diet.csv | 转置为 prey 行 × predator 列，列和=1；加 `Import` 行 |

### 5.2 L2 ↔ mizer（体型谱）
| L2 | mizer species_params.csv | 说明 |
|---|---|---|
| `w_inf`/`w_mat` | `w_inf`/`w_mat` | 仅含具 `w_inf` 的鱼类组 |
| `B0` | `biomass_observed` | |
| `diet`(鱼-鱼) | interaction.csv | 有链→1，否则基线 0.2 |

---

## 6. 互操作证据 / Interoperability evidence（"模型无关"的可验证依据）

运行 `node prototype/adapters/roundtrip-test.js`：

```
Rpath (Ecopath) adapter — L2 → native CSV → L2:
  ✓ groups: id/type/biomass/PB/QB preserved (18 groups)
  ✓ diet matrix: all predator→prey fractions preserved
  ✓ emitted diet columns sum to 1 (Ecopath valid)
mizer (size-spectrum) adapter — L2 → native CSV → L2:
  ✓ fish species: id/w_inf/w_mat/biomass preserved (9 species)
  ✓ fish–fish predation links preserved via interaction matrix
ALL ROUND-TRIP CHECKS PASSED ✓
```

- **两个结构不同的引擎范式**（质量平衡 vs 体型谱）经 L2 往返**无损**（结构字段）。
- 生成的原生文件（`adapters/out/rpath_model.csv`、`rpath_diet.csv`、`mizer_species_params.csv`、`mizer_interaction.csv`）可**直接**被 `read.rpath.params()` / `newMultispeciesParams()` 载入（无需改格式）。
- L2 实例通过 `l2-schema.json`（JSON Schema Draft-07）校验；食性分数逐捕食者和 ≈1。

> 这满足论文线 2（[12](12-paper2-software-plan.md) §7）的投稿硬门槛"**≥1 真实引擎适配器证明模型无关**"——此处提供 **2 个**。

---

## 7. 使用 / Usage

```bash
# 导出为 Rpath 原生参数文件
node prototype/adapters/rpath-adapter.js export prototype/data/foodweb-yangtze.json out/
# 导出为 mizer 原生输入
node prototype/adapters/mizer-adapter.js export prototype/data/foodweb-yangtze.json out/
# 往返一致性 + 生成全部原生文件
node prototype/adapters/roundtrip-test.js
```

在 R 中载入（示意）：
```r
library(Rpath);  ecc <- read.rpath.params("out/rpath_model.csv","out/rpath_diet.csv"); m <- rpath(ecc)
library(mizer);  sp <- read.csv("out/mizer_species_params.csv"); int <- as.matrix(read.csv("out/mizer_interaction.csv", row.names=1)); p <- newMultispeciesParams(sp, interaction=int)
```

---

## 8. 局限与展望 / Limitations & roadmap
- 往返保证**结构字段**无损；引擎特有参数（如 mizer 的 `k_vb`、Rpath 的 fleet/discards）当前用默认值填充，可在后续版本作为可选 L2 字段纳入。
- 大数组（时空物理场、集合）建议 v0.4 引入 Parquet/NetCDF 侧车（[06](06-framework-design.md) §5）。
- 计划适配器：LIM/`limSolve`（不确定性流网）、GLM-AED/CE-QUAL-W2（物理场，[09](09-phase2-coupling.md) §5）、enaR（网络指标）。
