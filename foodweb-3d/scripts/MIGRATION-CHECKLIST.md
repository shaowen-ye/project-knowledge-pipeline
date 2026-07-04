# 迁移清单 · foodweb-3d → 独立私有仓库 / Migration Checklist

> 目标：把整个 `foodweb-3d/`（知识库 01–16 + DECISIONS + `prototype/` 软件）从
> `project-knowledge-pipeline` 迁为独立私有仓库 **`shaowen-ye/foodweb-3d`**，打 `v0.3.0`。
> 所有 `gh`/建仓步骤须在**你本机**运行（本 Claude 会话的 GitHub 集成无建仓权限）。

---

## A. 迁移前 / Pre-flight

- [ ] **A1** 本机装好 `git` 与 `gh`：`git --version && gh --version`
- [ ] **A2** `gh` 已登录你的账户：`gh auth status`（否则 `gh auth login`）
- [ ] **A3** 拉到含迁移脚本的最新分支：
  ```bash
  cd <你的 project-knowledge-pipeline 本地目录>
  git fetch origin claude/food-web-3d-ecosystem-0vl4b4
  git checkout claude/food-web-3d-ecosystem-0vl4b4 && git pull
  ```
- [ ] **A4** 确认脚本在位：`ls foodweb-3d/scripts/migrate-to-standalone.sh`
- [ ] **A5** 确认 `shaowen-ye/foodweb-3d` 尚不存在（脚本也会自查；如已占用先改名或删除）

## B. 执行迁移 / Migrate（一条命令）

- [ ] **B1** 在 `project-knowledge-pipeline` 仓库**根目录**运行：
  ```bash
  bash foodweb-3d/scripts/migrate-to-standalone.sh foodweb-3d --private
  ```
  脚本自动：环境/重名检查 → `git subtree split`（保留历史；无 subtree 时自动改无历史快照）→
  `gh` 建**私有**仓 → 推送 `main` → 打 `v0.3.0` → 打印后续提示。
- [ ] **B2** 结束看到 `✅ Standalone repo: https://github.com/shaowen-ye/foodweb-3d (private, tag v0.3.0)`

## C. 验证新仓库 / Verify

- [ ] **C1** 打开 https://github.com/shaowen-ye/foodweb-3d ，确认：根目录有 16 篇文档 +
      `README.md` + `DECISIONS.md` + `prototype/`，可见 tag `v0.3.0`，仓库为 **Private**
- [ ] **C2** 软件测试（本机工作副本，路径见脚本输出，默认 `/tmp/foodweb-3d-standalone`）：
  ```bash
  cd /tmp/foodweb-3d-standalone/prototype && npm install && npm test   # 期望 9/9 ✓
  ```
- [ ] **C3** （几分钟后）GitHub 仓库 **Actions** 标签出现 CI 运行并通过（Node 18/20/22）

## D. 收尾原仓库 / Detach from project-knowledge-pipeline

- [ ] **D1** **关闭 PR #1（不合并）**：foodweb-3d 已独立成仓，不并入 `project-knowledge-pipeline`
      → PR 页面 “Close pull request”（可留一句说明：已迁至 `shaowen-ye/foodweb-3d`）
- [ ] **D2** （可选）删除已无用的分支：
  ```bash
  git push origin --delete claude/food-web-3d-ecosystem-0vl4b4
  ```
- [ ] **D3** （可选）若你从不打算把 foodweb-3d 留在 pipeline，`project-knowledge-pipeline` 的
      `main` 本就没有它（PR 未合并即可），无需额外清理

## E. Zenodo DOI（论文线 2 §T5，可稍后）

- [ ] **E1** https://zenodo.org → 用 GitHub 登录 → Settings → GitHub → 打开
      `shaowen-ye/foodweb-3d` 开关
- [ ] **E2** 在 GitHub 从 tag `v0.3.0` **发布一个 Release**（Releases → Draft new release → 选 v0.3.0）
      → Zenodo 自动铸 DOI
- [ ] **E3** 把 DOI 填进 `CITATION.cff` 的 `doi:` 字段并提交（软件论文/JOSS 引用用）

---

## 出问题时 / If something fails

| 现象 | 处理 |
|---|---|
| `ERROR: ... already exists` | 换名：`bash ...migrate-to-standalone.sh foodweb-3d-app --private`，或先删旧仓 |
| `git-subtree not found` | 脚本**自动**改走无历史快照，仍产出可用仓库（无需你干预） |
| `gh` 推送要求认证 | `gh auth login` 后重跑；脚本用 `gh` 的 ssh/https 偏好，无需手填 URL |
| 想公开而非私有 | 末参改 `--public`（或先私有，之后在仓库 Settings 改可见性） |
| 中途失败 | 脚本会清理临时分支；修正后**直接重跑**即可（幂等：会先删 `/tmp/...-standalone`） |

> 卡住就把终端输出贴回来，我帮你诊断。
