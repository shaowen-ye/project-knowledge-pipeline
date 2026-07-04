#!/usr/bin/env bash
#
# 把 foodweb-3d/prototype/ 提取为独立开源仓库并推送、打 v0.3.0。
# Extract foodweb-3d/prototype/ into a standalone open-source repo, create it on
# GitHub, push, and tag v0.3.0. History is preserved when git-subtree is present;
# otherwise a clean snapshot (no history) is used automatically.
#
# 为什么手动运行：Claude 会话在远程容器且无 gh CLI，其 GitHub 集成仅授权到
# project-knowledge-pipeline（新建仓库 403）。你本机的 gh（用你账户登录）有建仓权限。
#
# 前置 / Prereqs: git, gh (先 `gh auth login`)。从 project-knowledge-pipeline 根目录、
# 且在含最新 prototype/ 的分支上运行（例如 pull 后的 main 或 feature 分支）。
# 用法 / Usage:
#   bash foodweb-3d/prototype/scripts/extract-standalone-repo.sh [repo-name] [--private|--public|--internal]
#
set -euo pipefail

REPO_NAME="${1:-foodweb-3d}"
VISIBILITY="${2:---private}"
PREFIX="foodweb-3d/prototype"
SPLIT_BRANCH="foodweb-3d-split"
OUT="${TMPDIR:-/tmp}/${REPO_NAME}-standalone"
DESC="Open, spatially explicit, 3D-interactive, uncertainty-aware food-web simulation framework for regulated inland waters (model-agnostic L2 interchange + physics-trophic coupling)."

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

# ---- 1) materialise a standalone working tree ----
if git subtree --help >/dev/null 2>&1; then
  echo "==> [1/4] extracting $PREFIX WITH history (git subtree)"
  git branch -D "$SPLIT_BRANCH" >/dev/null 2>&1 || true
  git subtree split --prefix="$PREFIX" -b "$SPLIT_BRANCH"
  git clone --quiet --branch "$SPLIT_BRANCH" --single-branch "$SRC" "$OUT"
  cd "$OUT"
  git checkout -q -B main
  git branch -D "$SPLIT_BRANCH" >/dev/null 2>&1 || true   # drop the leftover split branch in OUT
  git remote remove origin >/dev/null 2>&1 || true         # detach from the parent clone
else
  echo "==> [1/4] git-subtree not found — extracting $PREFIX as a fresh snapshot (NO history)"
  git -C "$SRC" archive "HEAD:$PREFIX" | tar -x -C "$OUT"   # HEAD:<path> lands files at OUT root
  cd "$OUT"
  git init -q
  git checkout -q -B main
fi

# ---- 2) self-contained README (no broken ../ links) + single commit ----
cp scripts/README-standalone.md README.md
git add -A
git commit -q -m "foodweb-3d v0.3.0 (extracted from project-knowledge-pipeline)"

# ---- 3) create the GitHub repo and push (gh handles auth per your ssh/https pref) ----
echo "==> [2/4] creating $OWNER/$REPO_NAME ($VISIBILITY) and pushing"
gh repo create "$REPO_NAME" "$VISIBILITY" --source=. --remote=origin --push --description "$DESC" --disable-wiki

# ---- 4) tag v0.3.0 ----
echo "==> [3/4] tagging v0.3.0"
git tag -a v0.3.0 -m "foodweb-3d v0.3.0 — L2 interchange + Rpath/mizer adapters + 3D + physics coupling + theory module"
git push origin v0.3.0
echo "==> [4/4] done"

cat <<EOF

✅ Standalone repo: https://github.com/$OWNER/$REPO_NAME   (tag v0.3.0)
   Local working copy: $OUT

Next — Zenodo DOI (publication line 2 §T5):
  1. https://zenodo.org → Account → GitHub → toggle ON  $OWNER/$REPO_NAME
  2. On GitHub, publish a Release from tag v0.3.0  → Zenodo mints a DOI
  3. Put the DOI into CITATION.cff and the JOSS paper
Optional sanity check: cd "$OUT" && npm install && npm test    # expect 9/9 green
EOF
