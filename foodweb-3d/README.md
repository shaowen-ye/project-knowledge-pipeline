# 食物网 3D 交互模拟框架 · 知识库
# Food-Web 3D Interactive Simulation Framework · Knowledge Base

> 面向**受调控内陆水体（湖泊 / 水库 / 河流）**的食物网 **3D 交互显示、模拟与预测**框架的知识沉淀、空白分析与研发/发表路线图。以**长江流域**（十年禁渔 + 三峡生态调度 + 增殖放流）为旗舰验证系统。
>
> A durable knowledge base, gap analysis, and R&D/publication roadmap for a **3D interactive display, simulation, and prediction** framework for food webs in **regulated inland waters** (lakes / reservoirs / rivers), with the **Yangtze basin** (10-year fishing ban + Three Gorges ecological dispatch + stock enhancement) as the flagship test bed.

- **维护者 / Maintainer**: [填写 / TBD]
- **起始 / Started**: 2026-07
- **分支 / Branch**: `claude/food-web-3d-ecosystem-0vl4b4`
- **语言 / Language**: 中英双语（正文中文；方法名、期刊、引用保留英文 + DOI）

---

## 一句话论点 / Thesis in one paragraph

本领域已有成熟的**静态/物质平衡**工具（Ecopath/EwE、Rpath、LIM-MCMC、ENA/enaR）、成熟的**动态/机理**模拟器（Ecosim、Atlantis、mizer、OSMOSE、StrathE2E）、以及成熟的**物理解析**水体模型（GLM-AED、CE-QUAL-W2、AEM3D、Delft3D），但三类工具**彼此孤立**。**三个空白同时敞开、且各自独立够顶刊**：

1. **可视化空白** —— 没有可维护的、**3D 交互 + 时间动画 + 不确定性感知**、且与运行中**时空模拟耦合**的食物网渲染器；
2. **耦合空白** —— 淡水（湖库河）的**物理↔营养双向耦合**几乎空白，成熟度几乎全在海洋且多为单向强迫；
3. **理论空白** —— **Meta-生态系统理论**（Loreau et al. 2003）与应用型库河食物网建模基本脱节，而枝状库河系统恰是其理想试验台。

而 **长江十年禁渔 + 三峡生态调度 + 增殖放流** 是全球最大的在建**全流域操控实验**，至今无人做过整合建模。"集大成"贡献即：**以 meta-生态系统理论统一 静态网络 + 动态营养 + 空间/3D 通量 + 管理情景 的开源、空间显式、可交互框架，以长江为旗舰验证。**

---

## 文档索引 / Document index

| 文件 | 主题 | 一句话 |
|---|---|---|
| [01-methods-landscape.md](01-methods-landscape.md) | 方法与软件全景 | 静态/动态/数据驱动三大类，逐工具成熟度-优势-局限 |
| [02-visualization-3d.md](02-visualization-3d.md) | 3D/交互可视化 + 空白 | 现有渲染器与 4 点真空白 |
| [03-applications-yangtze.md](03-applications-yangtze.md) | 管理驱动与应用（长江锚定） | 禁渔/放流/生态调度/水文/外来种/气候/修复 的模型应用 |
| [04-theory.md](04-theory.md) | 需整合的营养理论 | 上行/下行、蜂腰、级联、meta-生态系统、跨系统补给 |
| [05-gaps-difficulties.md](05-gaps-difficulties.md) | 难点/缺陷/开放问题 | 不确定性、数据、结构、时空耦合、验证、互操作 |
| [06-framework-design.md](06-framework-design.md) | 拟建统一框架设计 | 引擎层-交换格式-3D 渲染层 + 情景引擎 |
| [07-roadmap.md](07-roadmap.md) | 研发+发表路线图 | 阶段 0→3，三条论文线，里程碑与风险 |
| [08-references.md](08-references.md) | 合并参考文献 | 按主题分组，带 DOI 与核实状态 |
| [DECISIONS.md](DECISIONS.md) | 决策日志 | 范围与方法决策的不可变记录 |

**阅读顺序建议**：初次通读按 `01 → 02 → 03 → 04 → 05 → 06 → 07`；只关心"我该做什么"看 `06`+`07`；只关心"别人做到哪了"看 `01`+`02`+`03`。

---

## 用户诉求 → 文档位置对照表 / Coverage map

> 用于零遗漏核对：用户原始列举的每一项都在下表有归属。

| 用户诉求 | 归属文档 |
|---|---|
| 3D 交互**显示** | 02 |
| **模拟** / **预测**（静态 + 动态模型方法） | 01, 06 |
| 实现方法（**软件包 / app**） | 01, 02, 06 |
| **湖泊 / 水库 / 河流** 数据使用与应用 | 03 |
| **捕捞管理** / EBFM | 03 §1 |
| **禁渔**（十年禁渔） | 03 §2 |
| **增殖放流** | 03 §3 |
| **生态调度**（三峡生态调度） | 03 §4 |
| **水文变化** / 水位波动 | 03 §5 |
| **外来种** | 03 §6 |
| **气候变化** | 03 §7 |
| **栖息地与水环境变化及修复** | 03 §8 |
| **上行 / 下行控制** | 04 §1 |
| **蜂腰效应** | 04 §2 |
| **级联效应** | 04 §3 |
| **Meta-生态系统** | 04 §4 |
| **历史 / 现状 / 进展** | 01, 02, 03 |
| **难点 / 缺陷 / 不足** | 05 |
| **集大成 / 制定开发** | 06 |
| **发布发表顶刊** | 07 §论文线 |

---

## 术语表 / Glossary（中英对照，全库统一）

| 中文 | English | 缩写 |
|---|---|---|
| 物质平衡 / 质量平衡模型 | mass-balance model | — |
| 生态通道模型 | Ecopath with Ecosim / Ecospace | EwE |
| 线性逆模型 | Linear Inverse Modeling | LIM |
| 生态网络分析 | Ecological Network Analysis | ENA |
| 上升性 / 优势度 | ascendency | — |
| 端到端模型 | end-to-end model | E2E |
| 体型谱模型 | size-spectrum model | — |
| 觅食竞技场理论 | foraging-arena theory | — |
| 经验动态建模 / 收敛交叉映射 | Empirical Dynamic Modeling / Convergent Cross Mapping | EDM / CCM |
| 联合物种分布模型 | Joint Species Distribution Model | JSDM |
| 稳定同位素混合模型 | stable-isotope mixing model | MixSIAR / simmr |
| 上行控制 / 下行控制 | bottom-up / top-down control | — |
| 蜂腰控制 | wasp-waist control | — |
| 营养级联 | trophic cascade | — |
| 元生态系统 / 超生态系统 | meta-ecosystem | — |
| 跨系统补给 | cross-ecosystem subsidy | — |
| 消落带 | drawdown zone / water-level-fluctuation zone | WLFZ |
| 四大家鱼 | four major Chinese carps（青、草、鲢、鳙） | — |
| 生态基流 / 生态调度 | environmental flow / ecological operation | e-flow |
| 生态系统途径渔业管理 | ecosystem-based fisheries management | EBFM |
| 生态数字孪生 | ecological digital twin | — |

---

## 引用与核实约定 / Citation conventions

- 每条文献尽量给 **DOI**；汇总见 [08-references.md](08-references.md)。
- 标记 `[待核实作者 / author TBV]` 者：已核实**研究存在、期刊与结论**，但作者全名待与 DOI 逐条核对——**定稿前必须核实**。
- 不粘贴会话原文；决策沉淀进 [DECISIONS.md](DECISIONS.md)。

---

## 现状 / Status

- **阶段 0（本知识库）**：进行中 → 完成即为可用综述底本与路线图。
- **阶段 1（3D 原型）**、**阶段 2（长江数据/耦合）**、**阶段 3（论文序列）**：见 [07-roadmap.md](07-roadmap.md)，本次未实现。
