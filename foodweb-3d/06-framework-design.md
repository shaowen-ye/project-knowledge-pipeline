# 06 · 拟建统一框架设计 / Proposed Unified Framework Design

> "集大成"的技术核心：面向受调控内陆水体、以 meta-生态系统理论统一 **静态网络 + 动态营养 + 空间/3D 通量 + 管理情景** 的开源、空间显式、可交互框架。本文给概念骨架、软件架构、交换格式与情景引擎。**这是设计草案，非最终实现**（实现排期见 [07](07-roadmap.md)）。

---

## 1. 设计原则 / Design principles

1. **不重造引擎**——包裹并互联已有成熟引擎（EwE/Rpath、mizer、LIM、GLM-AED/CE-QUAL-W2），而非重写营养或水动力求解器。
2. **不确定性为一等公民**——从输入到流到指标到像素，分布贯穿（见 [05](05-gaps-difficulties.md) §1）。
3. **空间显式、meta-生态系统原生**——局域食物网 + 跨系统流（补给）是核心数据结构，非事后拼接（见 [04](04-theory.md) §4–5）。
4. **计算与可视化解耦**——重计算离线/批量，3D 渲染层消费轻量、流式的结果，超数十节点仍可交互（见 [05](05-gaps-difficulties.md) §5）。
5. **模型无关交换格式**——一切引擎产出归一到统一 schema，解锁耦合/集合/共享渲染（见 [05](05-gaps-difficulties.md) §8）。

---

## 2. 概念骨架 / Conceptual skeleton

**meta-生态系统 = 一组局域 patch（湖区/河段/库段）× 跨 patch 空间流。**

- **节点（node）**：功能组 × patch，携带 生物量、营养级、P/B、Q/B、体型、不确定性分布。
- **局域边（intra-patch edge）**：捕食流（有向、加权、带不确定性），由静态（Ecopath/LIM）定结构、动态（Ecosim/mizer）定时变。
- **空间边（inter-patch edge）**：跨系统补给/迁移流——纵向漂流（drift）、消落带（WLFZ）产量脉冲、河湖连通鱼类洄游、外源碳输入。**这是 meta-生态系统层，也是当前应用建模的空白。**
- **物理场（physical field）**：水位、温度、分层、流速——由物理引擎（GLM-AED/CE-QUAL-W2）提供，**双向**调制局域与空间边（物理→营养，营养反馈→水质如抑藻）。
- **控制机制诊断**：在此骨架上计算上行/下行/蜂腰指数与级联传播（见 [04](04-theory.md)），作为情景对比的输出量。

数学上：局域动态用 Ecosim 型 foraging-arena ODE 或体型谱；空间流以 patch 间通量项耦合（reaction–diffusion / metacommunity–meta-ecosystem 形式，参 Massol et al. 2011、Gravel et al. 2016）；物理场作时变系数强迫并接受营养反馈。

---

## 3. 软件架构（三层）/ Architecture (three layers)

```
┌─────────────────────────────────────────────────────────┐
│  L3  3D 交互渲染层 / Interactive 3D renderer (Web)        │
│      three.js/WebGL · 营养级 z 轴 · 加权有向动画流         │
│      · 时间轴 scrubber · 空间水体底图 · 不确定性带         │
│      · 情景开关 · 节点/边钻取                              │
├─────────────────────────────────────────────────────────┤
│  L2  模型无关交换格式 / Model-agnostic interchange (schema)│
│      trophic network + dynamic state(t) + spatial context │
│      + uncertainty  →  单一 JSON/Parquet/NetCDF 规范       │
├─────────────────────────────────────────────────────────┤
│  L1  引擎层 / Engine layer (compute, 离线/批量)            │
│      静态: Ecopath/Rpath, LIM-MCMC, enaR                  │
│      动态: Ecosim, mizer, (选)Atlantis/OSMOSE             │
│      物理: GLM-AED / CE-QUAL-W2 / Delft3D                 │
│      数据: MixSIAR(同位素), rEDM(EDM/CCM), eDNA           │
│      情景引擎: 禁渔/放流容量/生态调度脉冲/入侵/增温        │
└─────────────────────────────────────────────────────────┘
```

- **L1 引擎层**：以适配器（adapter）包裹各引擎，统一输入/输出到 L2 schema。R 引擎经 `reticulate`/命令行/Rserve 暴露；物理引擎读其原生输出（GLM `.nc`、CE-QUAL-W2 输出）。
- **L2 交换格式**：**本项目的关键可复用件**。最小规范：`nodes[]`（组×patch，属性+分布）、`intra_edges[]`、`inter_edges[]`（空间流）、`fields[]`（物理场时空网格）、`time[]`、`scenario`（情景元数据）、`uncertainty`（每量的分布/区间表示）。建议 JSON 描述 + Parquet/NetCDF 存大数组。
- **L3 渲染层**：纯前端消费 L2；营养级 z 轴（Network3D 思想）× 加权有向动画流（Pawluczuk 2023 思想）× 空间水体底图（新）× 时间 scrubber × 不确定性带（新）。可作为 **Artifact** 渲染（阶段 1）。

---

## 4. 情景引擎 / Scenario engine

把 [03](03-applications-yangtze.md) 的管理驱动参数化为可开关、可对比的情景：

| 情景 | 参数化 | 输出诊断 |
|---|---|---|
| **禁渔** | 渔业死亡率 F→0，分阶段 | 网络复杂度、关键种迁移、营养级上移（对照禁渔后观测） |
| **增殖放流** | 放流种×数量→生物量注入，容纳量约束 | 总生物量净变化（含间接负效应）、生态容量 |
| **生态调度** | 洪水脉冲时序×量级→产卵补充脉冲（空间边） | 补充如何沿食物网传导；与产卵信号匹配度 |
| **水文/水位** | 水位过程线→消落带补给、生态位调制 | 食物网拓扑稳定性 |
| **外来种** | 引入节点+营养链→能量传递效率变化 | 效率下降、网络脆弱化 |
| **气候增温** | 温度场+物候前移 | 与固定调度的**解耦**、机制转换 |

**旗舰命题（论文线 3，无人闭合）**：生态调度洪水脉冲作为补给脉冲在网络中的传导，以及**增温是否使四大家鱼产卵信号与固定调度过程线解耦**——由情景引擎 + 空间边 + 物理场三者交汇实现。

---

## 5. 技术选型倾向（待 D-002 定稿）/ Tentative tech choices

- **L3 前端**：three.js/WebGL（成熟、Artifact 可渲染、社区大）。备选 deck.gl（地理空间强）。
- **L2 格式**：JSON schema + Parquet/NetCDF；优先复用生态既有约定（如 `Rpath`/`mizer` 对象结构）以降摄入成本。
- **L1 编排**：Python 为胶水（`reticulate` 调 R 引擎；`xarray`/`netCDF4` 读物理场），或 R 为主 + `shiny`/`plumber`。**核心权衡见 [DECISIONS.md](DECISIONS.md) 开放问题**。
- **不确定性**：状态空间（`ecostate`）+ LIM-MCMC（`samplelim`）为不确定性来源；渲染层以透明度/带宽/集合轨迹表达。

---

## 6. 与既有工作的边界 / What this is NOT

- 不是又一个 Ecopath 的湖 X 模型；是**统一 + 空间 + 3D 交互 + 情景**的框架。
- 不是替换 EwE/mizer/GLM-AED；是它们之上的**互联 + 可视化 + meta-生态系统**层。
- 不是纯可视化玩具；渲染层背后是真实耦合模型与不确定性。

---

## 7. 下一步 / Next

设计定稿后进入 [07-roadmap.md](07-roadmap.md) 阶段 1（3D 原型）。原型先以合成/单水体数据打通 L1→L2→L3，再进阶段 2 接长江真实数据与物理耦合。
