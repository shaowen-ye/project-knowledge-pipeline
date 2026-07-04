# 12 · 论文线 2 稿件框架与图表规划 / Publication Line 2 — Method + Software

> **方法+软件线**：开源、空间显式、**3D 交互、时空耦合、不确定性感知**的食物网框架本身即可引用贡献——把 meta-生态系统食物网建模变为可操作/战术化的决策支持工具（[07](07-roadmap.md)、Craig & Link 2023）。目标 *Methods in Ecology & Evolution* / *Ecological Modelling*（+ *JOSS* 软件发布伴随）。本文是软件/方法论文的可写入骨架。中英双语。

---

## 1. 核心论点 / One-sentence thesis

> **领域有优秀的静态网络工具、动态营养模拟器与物理解析水体模型，但三者孤立、可视化停留在静态 2D、不确定性不贯穿、无模型无关交换标准（[02](02-visualization-3d.md) §3、[05](05-gaps-difficulties.md)）。我们发布一个开源框架，用一个模型无关的 L2 交换格式把静态网络 + 动态营养 + 物理耦合互联，配以 3D 交互、时间动画、不确定性感知的渲染层，使受调控内陆水体的 meta-生态系统食物网建模首次成为可操作、可复现、可视化的一体工具。**

**为什么够方法刊**（[02](02-visualization-3d.md) §3、[05](05-gaps-difficulties.md) §8–9）：不是又一个模型,而是**他人可采用的框架**——填补"3D 交互动态可视化"与"淡水物理↔营养双向耦合"两处工具真空,并提供**模型无关交换格式**解锁耦合/集合/共享渲染。

### 核心特性 / Key features（= 卖点）
- **F1 模型无关 L2 交换格式**：groups × 营养级 × patch × 不确定性 + 食性 + 跨-patch 补给 + 物理场 + 情景。解锁 EwE/mizer/LIM/GLM-AED 互联与共享渲染。
- **F2 三层架构**：L1 引擎（包裹既有求解器）→ L2 交换格式 → L3 渲染。计算与可视化解耦。
- **F3 3D 交互 + 时间动画**：营养级 z 轴（Network3D 思想）+ 沿边能量粒子（Pawluczuk 2023 思想）+ 空间 patch 底图。
- **F4 物理↔营养双向耦合**：温度→速率、水位→补给、信号×调度→补充、藻→透明度（[09](09-phase2-coupling.md)），填补淡水耦合空白。
- **F5 不确定性贯穿**：输入→流→网络指标→像素（[05](05-gaps-difficulties.md) §1）。
- **F6 情景引擎**：禁渔/放流/调度/增温/入侵/自适应,即开即比。

---

## 2. 目标期刊与投稿策略 / Target journals

| 期刊 | 契合 | 何时选它 |
|---|---|---|
| **Methods in Ecology & Evolution**（推荐主投） | 新方法/软件 + 生态受众 + Application 类文 | 以"框架+交换格式+可复现 case+他用价值"为核心 |
| **Ecological Modelling** | 模型/软件 + 耦合方法 | 若审稿更看重耦合方法学与模型细节 |
| **JOSS**（伴随发布） | 纯软件短文 + DOI | 与主文并行,给可引用软件 DOI |
| **Environmental Modelling & Software** | 决策支持/数字孪生 | 若把"生态数字孪生/战术决策"作主线 |

**策略**：主投 **MEE**（Applications）；同步 **JOSS** 拿软件 DOI；被拒转 **Ecological Modelling / EMS**。

---

## 3. 标题候选 / Title options

1. *An open, spatially explicit framework for 3D-interactive, uncertainty-aware food-web simulation in regulated inland waters*
2. *Coupling static, dynamic and physical models through a model-agnostic interchange format for interactive food-web visualization*
3. 《面向受调控内陆水体的开源、空间显式、3D 交互、不确定性感知食物网模拟框架》
4. *Making meta-ecosystem food-web modelling operational: a coupled, interactive, uncertainty-aware toolkit*
5. *A food-web digital twin for lakes, reservoirs and rivers: interchange format, coupling, and interactive 3D*

> 推荐 #1（全面、准确）或 #4（"operational/战术化"钩,呼应 Craig & Link 2023）。

---

## 4. 摘要初稿 / Draft abstract（~200 词）

> **中文（工作稿）**：内陆水体食物网建模的方法各自成熟——静态物质平衡（Ecopath）、动态营养（Ecosim、mizer）、物理解析水体模型（GLM-AED、CE-QUAL-W2）——却彼此孤立：可视化停留在静态二维，不确定性不贯穿，跨模型无通用交换标准，淡水的物理↔营养双向耦合几近空白。我们提出并发布一个开源框架,以一个**模型无关的交换格式**把这些引擎互联,配以**3D 交互、时间动画、不确定性感知**的渲染层。框架用营养级为垂直轴、沿边能量粒子表现通量、空间 patch 底图承载 meta-生态系统流,并实现温度→速率、水位→消落带补给、产卵信号×生态调度→补充、浮游植物→水体透明度的**双向物理耦合**。我们以长江/三峡库区为可复现案例演示端到端流程,并与 Ecopath/mizer 型输出对照。框架把受调控内陆水体的 meta-生态系统食物网建模变为可操作、可复现、可视化的一体工具,代码、文档、测试与交换格式规范开源发布（DOI）。
>
> **English (working draft)**: Methods for inland-water food webs are individually mature — static mass balance (Ecopath), dynamic trophic (Ecosim, mizer), and physics-resolving water-body models (GLM-AED, CE-QUAL-W2) — yet they remain siloed: visualization stays static and 2-D, uncertainty is not propagated, there is no common cross-model interchange, and freshwater two-way physics–trophic coupling is nearly absent. We present and release an open framework that interconnects these engines through a **model-agnostic interchange format**, with a **3D-interactive, time-animated, uncertainty-aware** renderer. Trophic level is the vertical axis, energy particles animate flux along links, and a spatial patch basemap carries meta-ecosystem flows; the framework implements two-way physical coupling (temperature→rates, water level→littoral subsidy, spawning-cue×dispatch→recruitment, phytoplankton→clarity). We demonstrate an end-to-end workflow on the Yangtze/Three Gorges Reservoir as a reproducible case and benchmark against Ecopath/mizer-type outputs. The framework makes meta-ecosystem food-web modelling of regulated inland waters operational, reproducible, and visual; code, documentation, tests, and the interchange specification are released open source (DOI).

---

## 5. 逐节提纲 / Outline（软件/方法论文结构）

### Introduction（~600 词）
需求与四处空白（[02](02-visualization-3d.md) §3、[05](05-gaps-difficulties.md) §4/§8/§9）;战术化决策支持的呼唤（Craig & Link 2023）;贡献=框架+交换格式+可复现 case。

### Design & Implementation（~1200 词，核心）
- **架构**（L1 引擎 / L2 交换格式 / L3 渲染，[06](06-framework-design.md) §3）：图示 + 数据流。
- **L2 交换格式规范**（F1）：schema 字段、语义、版本、示例;为何模型无关。
- **L1 引擎与适配器**（F2）：如何包裹 Ecopath/Rpath/mizer/LIM + GLM-AED/CE-QUAL-W2;当前原型的 GLV + 降阶物理为参考实现。
- **L3 渲染**（F3）：营养级 z 轴、动画流、空间底图、不确定性表达。
- **物理↔营养耦合**（F4，[09](09-phase2-coupling.md)）：耦合接口契约。
- **不确定性传播**（F5）：状态空间/LIM-MCMC/集合如何进入渲染。

### Features / Usage（~700 词）
情景引擎（F6）;交互（旋转/时间轴/开关）;物理面板;导入导出（L2）;可复现脚本。

### Case study: Yangtze / Three Gorges（~800 词）
端到端:数据（[09](09-phase2-coupling.md) 真实强迫）→ L2 → 引擎 → 3D + 物理面板 → 情景对比。展示涌现式调度-信号-增温解耦作为工具能力（非本文科学主张,主张归论文线 3）。

### Comparison & Validation（~600 词）
与 EwE Flow diagram / mizer 输出对照;交换格式往返一致性;性能（节点/边规模、帧率）;不确定性可视化对比静态工具。

### Availability & Reproducibility
GitHub + Zenodo DOI;许可（MIT/BSD）;文档站;测试（引擎 Node 单测已有）;示例数据;`figures.json`/情景脚本可复现。

### Limitations & Conclusion
降阶物理非求解器（[09](09-phase2-coupling.md) §5）;参考引擎为演示级,真实引擎经适配器接入;展望多引擎/大规模/GPU。

---

## 6. 图表规划 / Figure plan（6 主图/表）

> **★ 已具备**：原型截图与图表现成（[07](07-roadmap.md) 阶段 1–2）。

| 图/表 | 内容 | 来源 | 原型 |
|---|---|---|---|
| **Fig 1** 架构图 | L1 引擎 / L2 交换格式 / L3 渲染 三层 + 数据流 | 绘制（[06](06-framework-design.md) §3） | — |
| **Fig 2** 交换格式 | L2 schema 图示 + 最小示例（groups/diet/inter_edges/physics/scenarios） | `prototype/data/foodweb-yangtze.json` | ★ |
| **Fig 3** 3D 界面 | 营养级 z 轴、动画流、空间 patch、不确定性壳层的标注截图 | 原型截图 | ★★（已有） |
| **Fig 4** 物理面板 | 三峡剖面 + 时序（水位/水温/叶绿素a/补充） | 原型物理面板截图 | ★★（已有） |
| **Fig 5** 案例情景 | 7 情景对比（网络指标 + 补充）小多图 | 引擎因子扫描（`figures.json` 型） | ★★ |
| **Table 1** 对比 | 本框架 vs EwE/mizer/Cheddar/Network3D：3D/动态/不确定性/耦合/交换格式/开源 | 综述（[01](01-methods-landscape.md)、[02](02-visualization-3d.md)） | — |

**落地提示**：Fig 3/4 已可直接用现有截图;Fig 5 用 `figures.json` 管线;Fig 1/2 与 Table 1 待绘制/整理。**本线图几乎全部现成或近现成**——是三条线中最快可投的。

---

## 7. 发布工程清单 / Release engineering（软件刊硬指标）

| 项 | 现状 | 待办 |
|---|---|---|
| 开源仓库 | `foodweb-3d/prototype/` 已在 GitHub | 独立仓库 + 语义化版本 + release |
| 许可 | 未定 | MIT/BSD;vendored three.js 保留 MIT header（已保留） |
| 文档 | `prototype/README.md` | 文档站/教程/API + L2 格式规范单独文档 |
| 测试 | 引擎 Node 手测 | CI + 单元测试（引擎稳定性/守恒/交换格式往返） |
| 可复现 | `data.js`/`figures.json`/情景 | 一键复现脚本 + 示例数据 |
| 软件 DOI | 无 | Zenodo 归档 → DOI（JOSS 需要） |
| 互操作 | JSON 参考实现 | 至少 1 个真实引擎适配器（Rpath 或 mizer）证明"模型无关" |

> **审稿硬门槛**（软件刊）：**他人可采用**——需真实引擎适配器（不能只有自带 GLV 演示）、文档、测试、DOI、真实 case。这是本线投稿前的关键补强。

---

## 8. 新颖性与辩护 / Novelty & defense

| 主张 | 为何新 | 辩护 |
|---|---|---|
| 模型无关交换格式互联静态+动态+物理 | 领域无通用交换标准（[05](05-gaps-difficulties.md) §8） | schema 规范 + ≥1 真实引擎适配器 + 往返一致性测试 |
| 3D 交互 + 时间动画 + 不确定性感知渲染 | 填补可视化真空（[02](02-visualization-3d.md) §3） | 与静态 2D 工具对比;可扩展性/帧率 |
| 淡水物理↔营养双向耦合 | 成熟度几乎全在海洋且单向（[05](05-gaps-difficulties.md) §4） | 耦合接口契约 + 案例;真实内核接入路径 |

**审稿人异议应对**：
- "只是可视化包装" → 强调交换格式 + 双向耦合 + 不确定性,非纯前端;给真实引擎适配器。
- "参考引擎是演示级" → 明确框架价值在**互联与渲染**,引擎经适配器可换;提供真实适配器证明。
- "维护性" → CI/测试/DOI/文档;vendored 依赖策略说明。

---

## 9. 任务清单 / Task checklist
- [ ] **T1**：独立开源仓库 + 许可 + 版本/release。
- [x] **T2**：**L2 交换格式规范**单独文档（字段/语义/版本/示例）→ Fig 2。✅ [`13-L2-interchange-spec.md`](13-L2-interchange-spec.md) + `prototype/data/l2-schema.json`（JSON Schema，已校验通过）。
- [x] **T3**：≥1 真实引擎适配器证明"模型无关"（投稿硬门槛）。✅ **已提供 2 个**：`prototype/adapters/rpath-adapter.js`（Ecopath 质量平衡）+ `mizer-adapter.js`（体型谱）——两种正交范式经 L2 往返无损，`roundtrip-test.js` 全通过。
- [x] **T4（部分）**：**测试套件 + CI + 许可 + 引用**已就位——`prototype/tests/run.js`（8 项:引擎稳定/Schema/双适配器往返/理论,全通过）、`.github/workflows/ci.yml`（Node 18/20/22）、`LICENSE`(MIT)、`CITATION.cff`、`CONTRIBUTING.md`、`package.json`。待补:文档站。
- [~] **T5**：独立仓库化**工具已就位**——`prototype/scripts/extract-standalone-repo.sh`（subtree split 保留历史 + `gh` 建仓 + 推送 + 打 v0.3.0）+ `README-standalone.md`（自包含）。**须你本机运行**：本会话 GitHub 集成仅授权 project-knowledge-pipeline,无法新建仓库(403);`gh` 在你账户下可。之后 Zenodo DOI + JOSS 短文。
- [ ] **T6**：整理 Fig 1/3/4/5 + Table 1;写作按 §5;投 MEE Applications。

> **投稿硬门槛 T2/T3 已达成**（L2 规范+Schema、2 个真实引擎适配器往返验证）;**发布工程 T4 大部到位**（测试/CI/许可/引用/贡献指南）。剩余:独立仓库化 + Zenodo DOI（T5）、图表整理与写作（T6）。

---

## 10. 与其他论文线的边界 / Boundaries
- **vs 线 1/3（理论/实证）**：本线卖点是**工具本身**;科学发现（相图、禁渔综合）归线 1/3,本文仅以其为"工具能力演示",不作科学主张。
- **复用关系**：线 1 用本工具产相图,线 3 用本工具产 Fig 4–6;三线互相引用,本线提供基础设施。
- **最快可投**：本线图几乎现成、原型已跑通,补"真实引擎适配器 + 发布工程"即可投——建议三线中**先投本线**（[07](07-roadmap.md) 已建议）。
