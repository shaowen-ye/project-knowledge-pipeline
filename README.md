# Project Knowledge Pipeline / 项目知识沉淀流水线

## 中文

`project-knowledge-pipeline` 是一个面向 Claude Code 长期项目的 skill。它的目标不是保存所有对话，而是把真正重要的项目知识沉淀下来，并在需要时让会话历史能够跟着项目一起迁移。

这个 skill 主要适合技术项目、研究项目、数据分析项目、长期写作项目和长期工程项目。对于只会短期存在的临时目录，它通常没有必要。对于涉及医疗、个人、家庭或财务内容的敏感项目，不应启用项目绑定。

### 它做什么

这个 skill 由三层组成，按重要性排序。

#### 1. 决策日志

最核心的一层是在项目根目录维护一个 `DECISIONS.md`。每当你和 Claude Code 讨论后达成了一个明确决定，就把结果写成结构化条目，记录背景、备选方案、最终选择、理由和后果。

这样做的价值在于：几年之后你可能已经不用 Claude Code 了，但 `DECISIONS.md` 仍然能告诉你当时为什么这样做。它是这个 skill 最重要、也最稳定的部分。

#### 2. 会话保留与备份

第二层是运维层面的保护。Claude Code 的原始会话历史保存在 `~/.claude/projects/` 下，会受到清理周期和本机存储的影响。这个 skill 会引导你把会话历史当作需要保留和备份的内容来对待，而不是默认它会一直存在。

#### 3. 可选的项目绑定

第三层是可选能力。它通过 `claude-bind` 把 Claude Code 的项目会话目录软链接到项目内的 `.claude-sessions/`，让项目搬家、归档、跨机器迁移时，会话历史也跟着项目走。

这一层只适合长期纯技术项目，不适合敏感内容项目，也不应该在不了解风险时默认开启。

### 什么时候用

这个 skill 最适合下面几类场景：

- 你正在启动一个会持续几个月甚至几年的项目
- 你希望把关键技术决策、方法决策或流程决策留下来
- 你担心项目换目录、归档、换电脑之后 Claude Code 历史断掉
- 你希望团队成员或未来的自己能快速理解“为什么这么做”

它不太适合：

- 一次性脚本或临时目录
- 不值得维护决策日志的小任务
- 含敏感对话、不能把会话痕迹带入项目目录的项目

### 典型工作流

#### 初始化长期项目

在新项目开始时，这个 skill 会帮助你：

- 确认项目根目录
- 创建 `DECISIONS.md`
- 填写项目元数据
- 视情况建议创建 `CLAUDE.md`
- 判断是否需要启用项目绑定

#### 记录一个决策

当你在讨论后确定了一个非琐碎结论，比如技术路线、参数设置、实现顺序、工具选择，这个 skill 会提示你把它记录为一个新的 `D-XXX` 条目，而不是让结论只停留在聊天记录里。

#### 搬迁、归档或跨机器迁移项目

如果项目启用了绑定，那么项目目录迁移后，只需要重新执行 `claude-bind rebind`，会话路径就会重新接好。这样项目和会话历史可以一起打包、一起复制、一起恢复。

### 快速开始

#### 全局安装

```bash
mkdir -p ~/.claude/skills
cd ~/.claude/skills
unzip ~/Downloads/project-knowledge-pipeline.zip
chmod +x project-knowledge-pipeline/assets/claude-bind
```

#### 仅当前项目安装

```bash
cd <your-project-root>
mkdir -p .claude/skills
cd .claude/skills
unzip ~/Downloads/project-knowledge-pipeline.zip
chmod +x project-knowledge-pipeline/assets/claude-bind
```

如果希望团队共享这个 skill，可以把项目内的 `.claude/skills/project-knowledge-pipeline` 一并提交到版本控制。

#### 验证安装

安装后开启一个新 Claude Code 会话，试试这些表达：

- `set up DECISIONS.md`
- `log this decision`
- `make this project portable`
- `claude-bind`
- `我刚刚定了一个技术方案，记一下`

如果 skill 生效，它会进入相应的初始化、记录或迁移流程。

### 关键文件

- [SKILL.md](/Users/YES/.claude/skills/project-knowledge-pipeline/SKILL.md)：skill 主指令文件，定义触发条件、工作流和行为约束
- [assets/DECISIONS.template.md](/Users/YES/.claude/skills/project-knowledge-pipeline/assets/DECISIONS.template.md)：`DECISIONS.md` 模板
- [assets/claude-bind](/Users/YES/.claude/skills/project-knowledge-pipeline/assets/claude-bind)：会话绑定脚本，支持 `bind`、`status`、`rebind`、`unbind`
- [references/architecture.md](/Users/YES/.claude/skills/project-knowledge-pipeline/references/architecture.md)：解释 Claude Code 会话存储机制、路径编码规则和故障恢复

### 安全边界

使用这个 skill 时，最重要的不是“能不能绑定”，而是“应不应该绑定”。

下面这些规则是硬边界：

- `.claude-sessions/` 一旦启用，必须进入 `.gitignore`
- 会话内容是明文，不提供加密保护
- 医疗、个人、家庭、财务类项目不要绑定
- 对外分享已绑定项目之前，应先 `unbind` 并清理 `.claude-sessions/`
- 不要把整个 `~/.claude/` 同步到 iCloud、Dropbox、OneDrive 这类云盘

拿不准时，默认不要启用第三层绑定；只保留 `DECISIONS.md` 和备份策略即可。

### README 和 SKILL.md 的关系

这个 `README.md` 是给人看的，帮助你理解这个 skill 的目的、适用范围和风险边界。

真正给 Claude Code 读取的是 [SKILL.md](/Users/YES/.claude/skills/project-knowledge-pipeline/SKILL.md:1)。如果你要调整触发词、工作流或提示语，应修改 `SKILL.md`；如果你只是想优化给人阅读的说明，应修改 `README.md`。

### 版本

- Current: `1.0`
- Platform: macOS / Linux
- Shell: bash `3.2+`

这个 skill 的第一层和第二层是稳健方案；第三层项目绑定利用了 Claude Code 当前的路径编码行为，因此在 Claude Code 升级后，建议对已绑定项目运行一次 `claude-bind status` 做检查。

---

## English

`project-knowledge-pipeline` is a skill for long-lived Claude Code projects. Its goal is not to preserve every conversation verbatim, but to sink the important project knowledge into durable artifacts and, when appropriate, make session history move with the project.

This skill is best suited for technical projects, research projects, data analysis work, long-form writing projects, and long-running engineering efforts. It is usually unnecessary for short-lived temporary directories. It should not enable project binding for sensitive projects involving medical, personal, family, or financial content.

### What it does

This skill has three layers, in order of importance.

#### 1. Decision log

The most important layer is maintaining a `DECISIONS.md` file at the project root. Whenever you and Claude Code reach a clear decision, the result is recorded as a structured entry including background, options considered, the final decision, rationale, and consequences.

Its value is simple: years later, even if you no longer use Claude Code, `DECISIONS.md` still tells you why the project took a given direction. This is the most durable and most important part of the skill.

#### 2. Session retention and backup

The second layer is operational protection. Claude Code stores raw session history under `~/.claude/projects/`, where it is affected by cleanup settings and local storage risks. This skill encourages you to treat session history as something that must be retained and backed up deliberately.

#### 3. Optional project binding

The third layer is optional. It uses `claude-bind` to symlink Claude Code's project session directory into `<project>/.claude-sessions/`, so session history moves with the project when the project is moved, archived, or migrated across machines.

This layer is suitable only for long-term technical projects. It is not appropriate for sensitive-content projects and should never be enabled casually.

### When to use it

This skill is a good fit when:

- you are starting a project that will last for months or years
- you want to preserve important technical, methodological, or process decisions
- you are worried that Claude Code history will break when the project moves, is archived, or changes machines
- you want future collaborators, or your future self, to understand why key decisions were made

It is usually not a good fit when:

- the project is a one-off script or temporary directory
- the work is too small to justify maintaining a decision log
- the project contains sensitive discussions that should not leave traces inside the project tree

### Typical workflows

#### Initialize a long-term project

At the start of a new project, this skill helps you:

- confirm the project root
- create `DECISIONS.md`
- fill in project metadata
- optionally create `CLAUDE.md`
- decide whether project binding should be enabled

#### Record a decision

After you settle on a non-trivial conclusion, such as a technical direction, parameter choice, implementation order, or tooling choice, the skill prompts you to record it as a new `D-XXX` entry instead of leaving it only in chat history.

#### Move, archive, or migrate a project

If the project is bound, moving the directory only requires `claude-bind rebind` to reconnect the session path. This allows the project and its session history to be packaged, copied, and restored together.

### Quick start

#### Install globally

```bash
mkdir -p ~/.claude/skills
cd ~/.claude/skills
unzip ~/Downloads/project-knowledge-pipeline.zip
chmod +x project-knowledge-pipeline/assets/claude-bind
```

#### Install for one project

```bash
cd <your-project-root>
mkdir -p .claude/skills
cd .claude/skills
unzip ~/Downloads/project-knowledge-pipeline.zip
chmod +x project-knowledge-pipeline/assets/claude-bind
```

If you want the whole team to share this skill, commit `.claude/skills/project-knowledge-pipeline` into version control.

#### Verify installation

Start a new Claude Code session and try prompts such as:

- `set up DECISIONS.md`
- `log this decision`
- `make this project portable`
- `claude-bind`
- `I just settled on a technical approach, log it`

If the skill is active, it should enter the relevant initialization, recording, or migration workflow.

### Key files

- [SKILL.md](/Users/YES/.claude/skills/project-knowledge-pipeline/SKILL.md): the main instruction file that defines triggers, workflows, and behavioral rules
- [assets/DECISIONS.template.md](/Users/YES/.claude/skills/project-knowledge-pipeline/assets/DECISIONS.template.md): template for `DECISIONS.md`
- [assets/claude-bind](/Users/YES/.claude/skills/project-knowledge-pipeline/assets/claude-bind): session-binding script supporting `bind`, `status`, `rebind`, and `unbind`
- [references/architecture.md](/Users/YES/.claude/skills/project-knowledge-pipeline/references/architecture.md): explanation of Claude Code session storage, path encoding, and failure recovery

### Security boundaries

The key question is not whether binding is possible, but whether it is appropriate.

These are hard boundaries:

- once enabled, `.claude-sessions/` must be in `.gitignore`
- session content is stored in plaintext and is not encrypted
- do not bind projects involving medical, personal, family, or financial material
- before sharing a bound project externally, `unbind` it and remove `.claude-sessions/`
- do not sync the entire `~/.claude/` directory to iCloud, Dropbox, or OneDrive

When in doubt, do not enable the third layer. Keeping only `DECISIONS.md` plus backups is often enough.

### How this README relates to SKILL.md

This `README.md` is written for humans. It explains the purpose, scope, and risk boundaries of the skill.

The file Claude Code actually reads is [SKILL.md](/Users/YES/.claude/skills/project-knowledge-pipeline/SKILL.md:1). If you want to change trigger phrases, workflows, or prompts, edit `SKILL.md`. If you only want to improve human-facing documentation, edit `README.md`.

### Version

- Current: `1.0`
- Platform: macOS / Linux
- Shell: bash `3.2+`

Layers 1 and 2 are robust by design. Layer 3 relies on Claude Code's current path-encoding behavior, so after Claude Code upgrades you should run `claude-bind status` on bound projects to verify everything still resolves correctly.
