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
| D-002 | | 技术选型（L3 前端 / L2 格式 / L1 编排语言） | tooling | 🟡 Proposed |
| D-003 | | 旗舰水体选择（三峡库区 vs 鄱阳湖 vs 其他） | data | ⏸ Deferred |

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

## 4. 已废止决策 / Superseded

（暂无 / none yet）

---

## 5. 开放问题 / Open questions

> 需尽快决定但未成熟。决定后移入 §3。

- [ ] **D-002 技术选型**：L3 前端 three.js vs deck.gl；L2 交换格式 JSON+Parquet vs NetCDF；L1 编排 Python(`reticulate`) 为主 vs R(`shiny`/`plumber`) 为主。
- [ ] **D-003 旗舰水体**：三峡库区（调度信号强、数据多）vs 鄱阳湖（水位-连通、meta-生态系统叙事强）vs 多水体对比。
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
