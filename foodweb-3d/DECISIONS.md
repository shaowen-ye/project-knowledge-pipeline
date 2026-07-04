# DECISIONS — 食物网 3D 交互模拟框架 / Food-Web 3D Framework

> 记录本项目每个有意义的方法学、技术与流程决策。达成结论后 24 小时内沉淀于此。
> 目标：跨设备、跨年、跨工具地保存"为什么这么做"。
> 格式复用仓库模板 `assets/DECISIONS.template.md`（ADR 风格）。
>
> **维护者 / Maintainer**: [填写]
> **起始 / Started**: 2026-07
> **最后更新 / Last updated**: 2026-07-04

---

## 1. 项目元数据 / Project metadata

| 字段 | 值 |
|---|---|
| 项目名 | 食物网 3D 交互模拟框架（受调控内陆水体 / meta-生态系统） |
| 主要目标 | 集大成统一 静态+动态+空间/3D+管理情景 的开源可交互框架，长江旗舰验证，冲顶刊 |
| 关键交付物 | 知识库（本库）→ 3D 原型 → 论文序列（理论/方法+软件/大综合）|
| 工作目录 | `foodweb-3d/`（仓库 `project-knowledge-pipeline`） |
| 主仓库 | shaowen-ye/project-knowledge-pipeline |
| 开发分支 | `claude/food-web-3d-ecosystem-0vl4b4` |

---

## 2. 决策索引 / Decision index

| ID | 日期 | 主题 | 域 | 状态 |
|---|---|---|---|---|
| D-001 | 2026-07-04 | 阶段 0 范围：交付物/锚定系统/顶刊定位/语言 | process | ✅ Accepted |
| D-002 | 2026-07-04 | 阶段 1 原型技术选型（L3 three.js / L2 JSON / L1 纯 JS） | tooling | ✅ Accepted |
| D-003 | 2026-07-04 | 阶段 1 旗舰=3-patch 长江 meta 系统（示意级） | data | ✅ Accepted |

**状态图例**：✅ Accepted · 🟡 Proposed · ⏸ Deferred · 🔁 Revised · ❌ Superseded

---

## 3. 决策记录 / Decision records

> 逆序，最新在上。✅ Accepted 后正文不可变，改动另开新条目引用之。

---

### D-001 阶段 0 范围锁定：交付物 / 锚定系统 / 顶刊定位 / 语言

- **Date**: 2026-07-04
- **Status**: ✅ Accepted
- **Domain**: process
- **Phase**: 阶段 0（知识库）

**Background**

项目提出一个横跨"知识综合→软件研发→顶刊发表"的大工程。本仓库无任何食物网既有代码（greenfield）。启动前须锁定四项范围决策，否则后续研发与写作方向不定。两路并行文献/工具调研（方法+软件、应用+理论）已完成，结论收敛为三大空白 + 长江旗舰机会。

**Options considered**

1. 起步交付物：知识库+路线图 / 3D 原型 / 顶刊稿件 / 三者合一
2. 锚定系统：长江流域 / 单一深案例 / 通用跨系统框架
3. 顶刊定位：理论统一 / 方法+软件 / 大综合 / 全覆盖
4. 语言：中英双语 / 全英文 / 全中文

**Decision**

(1) 起步交付物 = **知识库 + 路线图**（本 `foodweb-3d/`）；(2) 锚定 = **长江流域**（十年禁渔 + 三峡生态调度 + 增殖放流）；(3) 顶刊 = **暂不锁定主攻，路线图全覆盖三条论文线**；(4) 语言 = **中英双语**（正文中文，术语/方法名/期刊/引用英文+DOI）。

**Rationale**

1. 知识库是"集大成"的智力骨架，天然衍生原型与论文，最契合本仓库（知识沉淀）定位。
2. 长江十年禁渔+生态调度+放流是全球最大在建全流域操控实验，叙事最强、最易冲顶刊、且无人整合建模。
3. 三条论文线彼此依赖度低、可独立交付，早期不锁定主攻可保留灵活性。
4. 中英双语兼顾作者阅读与后续英文投稿。

**Consequences**

- ✓ 方向清晰，研发/写作可分阶段推进。
- ✓ 每条论文线独立可交付，降低单点失败风险。
- ✗ 长江数据获取（尤其论文线 3）是最大门槛，须尽早启动数据/合作申请。
- ✗ 三线全覆盖分散精力——路线图建议先攻方法+软件线收敛。

**References**

- Literature/docs: 见 `08-references.md`（含 EwE、meta-生态系统、蜂腰、级联、长江锚定案例）
- Code: 尚无（阶段 1 起）
- Data: 待定（D-003）
- CC session: 2026-07-04 `食物网 3D · 范围锁定 · 两路调研`
- Related decisions: D-002, D-003

---

### D-003 阶段 1 旗舰系统：3-patch 长江 meta-生态系统（示意级）

- **Date**: 2026-07-04
- **Status**: ✅ Accepted
- **Domain**: data
- **Phase**: 阶段 1（3D 原型）

**Background**

阶段 1 原型需要一个具体系统来演示架构与交互。真实旗舰水体（三峡库区 vs 鄱阳湖 vs 多水体）依赖数据获取，属阶段 2 决策。原型阶段只需一个能同时体现"营养级 + 空间 + 情景 + meta-生态系统"的示意拓扑。

**Options considered**

1. 单一真实水体实测数据（阻塞于数据获取）
2. 3-patch 示意 meta-生态系统（上游河段 / 三峡库区 / 通江湖泊）+ 合成数据
3. 通用无空间单 patch 食物网

**Decision**

采用 **3-patch 示意 meta-生态系统**（上游河段 / 三峡库区 / 通江湖泊）+ ~18 功能组合成数据；跨-patch 补给流（漂流/洄游/消落带）体现 meta-生态系统层。真实旗舰水体推迟到阶段 2（见开放问题）。

**Rationale**

1. 3-patch 拓扑直接演示 meta-生态系统空间流（本项目理论支柱，[04](04-theory.md) §4），优于单 patch。
2. 合成数据解耦"架构演示"与"数据获取"，不阻塞阶段 1。
3. 量级参照文献（长江中游 Ecopath、引种银鱼三库等），示意但不失真。

**Consequences**

- ✓ 阶段 1 不被数据获取阻塞，可立即演示。
- ✓ 空间流可视化就位，为阶段 2 真实耦合留好接口。
- ✗ 结果不可作科研结论——README 与界面均显式标注"演示级/合成"。
- ✗ 真实旗舰水体仍待定（阶段 2）。

**References**

- Code: `prototype/data/foodweb-yangtze.json`, `prototype/README.md`
- Related decisions: D-001, D-002

---

### D-002 阶段 1 原型技术选型：three.js(L3) / JSON(L2) / 纯 JS 引擎(L1)

- **Date**: 2026-07-04
- **Status**: ✅ Accepted
- **Domain**: tooling
- **Phase**: 阶段 1（3D 原型）

**Background**

阶段 1 需落地 [06](06-framework-design.md) 的 L1→L2→L3 三层。渲染层、交换格式、引擎语言各需选型，且要能作为自包含 Artifact 渲染（CSP 禁外部请求）。

**Options considered**

1. L3：three.js/WebGL vs deck.gl vs 原生 WebGL
2. L2：JSON(+data.js 全局) vs NetCDF/Parquet
3. L1：纯 JS 浏览器内 vs 调 R/Python 后端

**Decision**

L3 = **three.js r128 UMD**（暴露 `window.THREE`，全内联，CSP 友好）+ OrbitControls；L2 = **JSON** 交换格式实例 + 生成的 `data.js` 全局（免 `fetch`，`file://` 可运行）；L1 = **纯 JS** 生物量动态积分器（GLV，t0 质量平衡，浏览器/Node 双运行）。three.js 经 npm registry（代理白名单）取得并入库 `vendor/`。

**Rationale**

1. three.js UMD 内联使同一文件既可本地开、又可 GitHub、又可 Artifact（CSP 下零外部请求，已验证）。
2. JSON 直读、易审阅，阶段 1 数据量小；重数组（NetCDF/Parquet）留待阶段 2。
3. 纯 JS 引擎零后端依赖，原型即开即用；阶段 2 再换真实耦合引擎（Ecopath/Ecosim + GLM-AED）。
4. unpkg/CDN 被 egress 策略拦截（403），故经 npm registry 取 three 并入库。

**Consequences**

- ✓ 单文件自包含，浏览器/GitHub/Artifact 三处可用，已无头验证（零外部请求、无报错）。
- ✓ 引擎可 Node 单测，便于调参与回归。
- ✗ 演示级 GLV 非校准 Ecosim；vendor/three.min.js（~600KB）入库增大仓库体积。
- ✗ 纯前端不适合阶段 2 的重耦合计算——届时需引入后端/离线批算。

**References**

- Code: `prototype/src/{engine,render,ui}.js`, `prototype/index.html`, `prototype/index.artifact.html`, `prototype/vendor/`
- Related decisions: D-001, D-003

---

## 4. 已废止决策 / Superseded

（暂无 / none yet）

---

## 5. 开放问题 / Open questions

> 需尽快决定但未成熟。决定后移入 §3。

- [ ] **阶段 2 真实旗舰水体**：三峡库区（调度信号强、数据多）vs 鄱阳湖（水位-连通、meta-生态系统叙事强）vs 多水体对比。（阶段 1 用 3-patch 示意，见 D-003）
- [ ] **阶段 2 引擎升级**：把演示级 GLV 替换为真实耦合（Ecopath/Ecosim + GLM-AED/CE-QUAL-W2）的具体接法与 L2 格式规范化（JSON→加 Parquet/NetCDF 大数组）。
- [ ] 论文线 3 的**数据来源与授权**：先用已发表数据综合，还是申请原始监测数据/建立合作？
- [ ] 是否纳入 Atlantis/OSMOSE 作为可选高保真引擎，还是先只做 EwE/mizer/LIM + GLM-AED/CE-QUAL-W2？

---

## 6. 维护协议 / Maintenance protocol

1. **及时**：决策 24 小时内记录。
2. **不可变**：Accepted 条目不改；新方向 = 新 D-XXX 引用旧条。
3. **粒度**：一条一决策，纠缠议题拆分。
4. **会话引用**：只记日期+关键词，不粘原文。
5. **版本控制**：每条后 `git commit -m "decisions: D-XXX <title>"`。

---

*格式源自 ADR，见 [adr.github.io](https://adr.github.io)，按研究/工程项目通用化。*
