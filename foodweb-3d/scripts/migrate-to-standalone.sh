#!/usr/bin/env bash
#
# 把整个 foodweb-3d/ 迁移为独立私有仓库 shaowen-ye/foodweb-3d（保留历史），推送、打 v0.3.0。
# Migrate the ENTIRE foodweb-3d/ project into a standalone repo (default private),
# preserving history; create it on GitHub, push, and tag v0.3.0.
#
# 迁移单元 = 整个 foodweb-3d/（知识库 01–16 + DECISIONS + prototype/ 软件），
# 顶层 foodweb-3d/README.md 直接作为新仓库根 README（自包含，无 ../ 链接）。
# History is preserved when git-subtree is present; otherwise a clean snapshot.
#
# 为什么手动运行：Claude 会话在远程容器、无 gh CLI，其 GitHub 集成仅授权
# project-knowledge-pipeline（新建仓库 403）。你本机 gh（用你账户登录）有建仓权限。
#
# 前置 / Prereqs: git, gh (先 `gh auth login`)。从 project-knowledge-pipeline 根目录、
# 在含最新 foodweb-3d/ 的分支上运行。
# 用法 / Usage:
#   bash foodweb-3d/scripts/migrate-to-standalone.sh [repo-name] [--private|--public|--internal]
#   （默认 foodweb-3d、--private）
#
set -euo pipefail

REPO_NAME="${1:-foodweb-3d}"
VISIBILITY="${2:---private}"
PREFIX="foodweb-3d"                     # 迁移整个 foodweb-3d/（不只 prototype/）
SPLIT_BRANCH="foodweb-3d-split"
OUT="${TMPDIR:-/tmp}/${REPO_NAME}-standalone"
DESC="Open, spatially explicit, 3D-interactive, uncertainty-aware food-web simulation framework + knowledge base for regulated inland waters (Yangtze / Three Gorges); model-agnostic L2 interchange + two-way physics-trophic coupling + meta-ecosystem control-regime theory."

# ---- 0) validate args & environment ----
case "$VISIBILITY" in
  --private|--public|--internal) ;;
  *) echo "ERROR: 2nd arg must be --private, --public or --internal (got '$VISIBILITY')"; exit 1 ;;
esac
[ -d "$PREFIX" ] || { echo "ERROR: run from the project-knowledge-pipeline repo root (expected $PREFIX/)"; exit 1; }
command -v git >/dev/null || { echo "ERROR: git required"; exit 1; }
command -v gh  >/dev/null || { echo "ERROR: gh CLI required — https://cli.github.com , then 'gh auth login'"; exit 1; }
gh auth status >/dev/null 2>&1 || { echo "ERROR: not logged in — run 'gh auth login' first"; exit 1; }

SRC="$(pwd)"
OWNER="$(gh api user -q .login)"

# ---- fail fast if the repo already exists (before any local mutation) ----
if gh repo view "$OWNER/$REPO_NAME" >/dev/null 2>&1; then
  echo "ERROR: $OWNER/$REPO_NAME already exists — choose another name (arg 1) or delete it first."; exit 1
fi

# ---- always clean up the temp split branch in the parent repo on exit ----
cleanup() { cd "$SRC" 2>/dev/null && git branch -D "$SPLIT_BRANCH" >/dev/null 2>&1 || true; }
trap cleanup EXIT

rm -rf "$OUT"; mkdir -p "$OUT"

# ---- 1) materialise a standalone working tree from foodweb-3d/ ----
if git subtree --help >/dev/null 2>&1; then
  echo "==> [1/3] extracting $PREFIX/ WITH history (git subtree)"
  git branch -D "$SPLIT_BRANCH" >/dev/null 2>&1 || true
  git subtree split --prefix="$PREFIX" -b "$SPLIT_BRANCH"
  git clone --quiet --branch "$SPLIT_BRANCH" --single-branch "$SRC" "$OUT"
  cd "$OUT"
  git checkout -q -B main
  git branch -D "$SPLIT_BRANCH" >/dev/null 2>&1 || true
  git remote remove origin >/dev/null 2>&1 || true
else
  echo "==> [1/3] git-subtree not found — extracting $PREFIX/ as a fresh snapshot (NO history)"
  git -C "$SRC" archive "HEAD:$PREFIX" | tar -x -C "$OUT"
  cd "$OUT"
  git init -q
  git checkout -q -B main
  git add -A
  git commit -q -m "foodweb-3d v0.3.0 (migrated from project-knowledge-pipeline)"
fi

# foodweb-3d/README.md is already the self-contained root README — no swap needed.

# ---- 2) create the GitHub repo and push (gh handles auth per your ssh/https pref) ----
echo "==> [2/3] creating $OWNER/$REPO_NAME ($VISIBILITY) and pushing"
gh repo create "$REPO_NAME" "$VISIBILITY" --source=. --remote=origin --push --description "$DESC"

# ---- 3) tag v0.3.0 ----
echo "==> [3/3] tagging v0.3.0"
git tag -a v0.3.0 -m "foodweb-3d v0.3.0 — knowledge base 01-16 + 3D prototype + physics coupling + Rpath/mizer adapters + control-regime theory"
git push origin v0.3.0

cat <<EOF

✅ Standalone repo: https://github.com/$OWNER/$REPO_NAME   (private, tag v0.3.0)
   Local working copy: $OUT
   Software tests:  cd "$OUT/prototype" && npm install && npm test   # expect 9/9 green

After you confirm the new repo looks right:
  • Close PR #1 on project-knowledge-pipeline WITHOUT merging (foodweb-3d now lives
    in its own repo). Optionally delete the branch claude/food-web-3d-ecosystem-0vl4b4.
  • Zenodo DOI: zenodo.org → GitHub → toggle ON $OWNER/$REPO_NAME → publish a
    Release from tag v0.3.0 → put the DOI into CITATION.cff.
EOF
