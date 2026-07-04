#!/usr/bin/env bash
#
# 把 foodweb-3d/prototype/ 提取为独立开源仓库（保留历史）并推送、打 v0.3.0。
# Extract foodweb-3d/prototype/ into a standalone open-source repo (history
# preserved), create it on GitHub, push, and tag v0.3.0.
#
# 为什么手动运行：Claude 会话在远程容器且无 gh CLI，且其 GitHub 集成仅授权到
# project-knowledge-pipeline（新建仓库 403）。你本机的 gh（用你账户登录）有建仓权限。
# Why run this yourself: the Claude session is a remote container with no gh CLI,
# and its GitHub integration is scoped to project-knowledge-pipeline (repo create
# → 403). Your local gh, authenticated as you, can create the repo.
#
# 前置 / Prereqs: git, gh (先 `gh auth login`)。从 project-knowledge-pipeline 根目录运行。
# 用法 / Usage:
#   bash foodweb-3d/prototype/scripts/extract-standalone-repo.sh [repo-name] [--private|--public]
#
set -euo pipefail

REPO_NAME="${1:-foodweb-3d}"
VISIBILITY="${2:---private}"          # default private; pass --public to open it
PREFIX="foodweb-3d/prototype"
SPLIT_BRANCH="foodweb-3d-split"
OUT="${TMPDIR:-/tmp}/${REPO_NAME}-standalone"
DESC="Open, spatially explicit, 3D-interactive, uncertainty-aware food-web simulation framework for regulated inland waters (model-agnostic L2 interchange + physics-trophic coupling)."

# 0) sanity
[ -d "$PREFIX" ] || { echo "ERROR: run from the project-knowledge-pipeline repo root"; exit 1; }
command -v gh >/dev/null || { echo "ERROR: gh CLI required — https://cli.github.com , then 'gh auth login'"; exit 1; }
command -v git >/dev/null || { echo "ERROR: git required"; exit 1; }

SRC="$(pwd)"
echo "==> [1/5] splitting $PREFIX history into $SPLIT_BRANCH (this preserves commit history)"
git branch -D "$SPLIT_BRANCH" 2>/dev/null || true
git subtree split --prefix="$PREFIX" -b "$SPLIT_BRANCH"

echo "==> [2/5] materialising a standalone repo at $OUT"
rm -rf "$OUT"
git clone --quiet --branch "$SPLIT_BRANCH" --single-branch "$SRC" "$OUT"
cd "$OUT"
git checkout -q -B main
git remote remove origin 2>/dev/null || true   # detach from the parent clone

echo "==> [3/5] swapping in the self-contained README (no broken ../ links)"
cp scripts/README-standalone.md README.md
git add README.md
git commit -q -m "docs: self-contained standalone README" || true

echo "==> [4/5] creating GitHub repo and pushing (gh handles auth)"
gh repo create "$REPO_NAME" "$VISIBILITY" --source=. --remote=origin --push --description "$DESC" --disable-wiki

echo "==> [5/5] tagging v0.3.0"
git tag -a v0.3.0 -m "foodweb-3d v0.3.0 — L2 interchange + Rpath/mizer adapters + 3D + physics coupling + theory module"
git push origin v0.3.0

# clean up the split branch in the parent repo
cd "$SRC"
git branch -D "$SPLIT_BRANCH" 2>/dev/null || true

OWNER="$(gh api user -q .login)"
cat <<EOF

✅ Done. Standalone repo: https://github.com/$OWNER/$REPO_NAME  (tag v0.3.0)
   Local working copy: $OUT

Next — Zenodo DOI (publication line 2 §T5):
  1. https://zenodo.org → Account → GitHub → toggle ON  $OWNER/$REPO_NAME
  2. On GitHub, publish a Release from tag v0.3.0  → Zenodo mints a DOI
  3. Put the DOI into CITATION.cff and the JOSS paper
Optional CI check: cd "$OUT" && npm install && npm test
EOF
