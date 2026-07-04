#!/usr/bin/env bash
#
# 把 foodweb-3d/prototype/ 提取为独立开源仓库（保留历史）并推送、打 v0.3.0。
# Extract foodweb-3d/prototype/ into a standalone open-source repo (history
# preserved), create it on GitHub, push, and tag v0.3.0.
#
# 为什么手动运行：本会话的 GitHub App 集成仅授权到 project-knowledge-pipeline，
# 无法新建仓库（403）。gh CLI 在你本机用你的账户则有建仓权限。
# Why run this yourself: the session's GitHub App integration is scoped to
# project-knowledge-pipeline and cannot create new repos (403). Your local
# gh CLI, authenticated as you, can.
#
# 前置 / Prereqs: git, gh (已 `gh auth login`)。从 project-knowledge-pipeline 根目录运行。
# Usage:
#   bash foodweb-3d/prototype/scripts/extract-standalone-repo.sh [repo-name] [--private|--public]
#
set -euo pipefail

REPO_NAME="${1:-foodweb-3d}"
VISIBILITY="${2:---private}"          # default private; pass --public to open it
PREFIX="foodweb-3d/prototype"
SPLIT_BRANCH="foodweb-3d-split"
DESC="Open, spatially explicit, 3D-interactive, uncertainty-aware food-web simulation framework for regulated inland waters (model-agnostic L2 interchange + physics-trophic coupling)."

# 0) sanity
[ -d "$PREFIX" ] || { echo "run from the project-knowledge-pipeline repo root"; exit 1; }
command -v gh >/dev/null || { echo "gh CLI required (https://cli.github.com)"; exit 1; }
OWNER="$(gh api user -q .login)"

echo "==> splitting $PREFIX history into $SPLIT_BRANCH"
git branch -D "$SPLIT_BRANCH" 2>/dev/null || true
git subtree split --prefix="$PREFIX" -b "$SPLIT_BRANCH"

echo "==> creating GitHub repo $OWNER/$REPO_NAME ($VISIBILITY)"
gh repo create "$REPO_NAME" "$VISIBILITY" --description "$DESC" --disable-wiki || true

REMOTE="https://github.com/$OWNER/$REPO_NAME.git"

echo "==> pushing split branch to $REMOTE main"
git push "$REMOTE" "$SPLIT_BRANCH:main"

# 1) swap the parent-relative README for the self-contained standalone one,
#    in a fresh clone (so the standalone repo's README has no broken ../ links)
TMP="$(mktemp -d)"
git clone "$REMOTE" "$TMP/repo"
cp "$PREFIX/scripts/README-standalone.md" "$TMP/repo/README.md"
( cd "$TMP/repo"
  git add README.md
  git commit -m "docs: self-contained standalone README" || true
  git push origin main
  echo "==> tagging v0.3.0"
  git tag -a v0.3.0 -m "foodweb-3d v0.3.0 — L2 interchange + Rpath/mizer adapters + 3D + physics coupling + theory module"
  git push origin v0.3.0
)
rm -rf "$TMP"
git branch -D "$SPLIT_BRANCH" 2>/dev/null || true

cat <<EOF

Done. Next steps for the Zenodo DOI (publication line 2 §T5):
  1. Enable the repo in https://zenodo.org (GitHub → toggle on $OWNER/$REPO_NAME).
  2. On GitHub, publish a Release from tag v0.3.0 — Zenodo mints a DOI.
  3. Put the DOI in CITATION.cff and the JOSS paper.
Repo: $REMOTE
EOF
