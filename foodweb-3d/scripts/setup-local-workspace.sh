#!/usr/bin/env bash
#
# 在本地 Mac 建立 foodweb-3d 独立工作文件夹（从 GitHub 分支提取整个 foodweb-3d/，
# 保留历史，初始化为独立 git 仓库）。不建 GitHub 远端 —— 纯本地工作副本。
# Set up a local foodweb-3d working folder on your Mac by extracting the whole
# foodweb-3d/ from the GitHub branch (history preserved) and initialising a
# standalone local git repo. No GitHub remote is created — local only.
#
# 用法 / Usage:
#   bash setup-local-workspace.sh "<父目录>" [分支]
# 例 / Example:
#   bash setup-local-workspace.sh "/Users/YES/Documents/10_科研工作/20_项目执行/20_食物网结构与功能项目"
#
set -euo pipefail

PARENT="${1:?用法: bash setup-local-workspace.sh \"<父目录>\" [分支]}"
BRANCH="${2:-claude/food-web-3d-ecosystem-0vl4b4}"
PIPELINE_URL="https://github.com/shaowen-ye/project-knowledge-pipeline.git"
DEST="$PARENT/foodweb-3d"
TMP="$(mktemp -d)"

command -v git >/dev/null || { echo "ERROR: 需要 git"; exit 1; }
[ -d "$PARENT" ] || { echo "ERROR: 父目录不存在: $PARENT"; exit 1; }
[ -e "$DEST" ] && { echo "ERROR: 目标已存在: $DEST （先移走或改名）"; exit 1; }

echo "==> [1/4] 克隆 project-knowledge-pipeline 分支 $BRANCH（浅历史足够提取）"
git clone --quiet --branch "$BRANCH" --single-branch "$PIPELINE_URL" "$TMP/pk"

cd "$TMP/pk"
echo "==> [2/4] 提取整个 foodweb-3d/"
if git subtree --help >/dev/null 2>&1; then
  git subtree split --prefix=foodweb-3d -b _fw_split >/dev/null 2>&1
  git clone --quiet --branch _fw_split --single-branch "$TMP/pk" "$DEST"
  cd "$DEST"; git checkout -q -B main
  git branch -D _fw_split >/dev/null 2>&1 || true
  git remote remove origin >/dev/null 2>&1 || true
  echo "    （已保留提交历史）"
else
  mkdir -p "$DEST"
  git -C "$TMP/pk" archive "HEAD:foodweb-3d" | tar -x -C "$DEST"
  cd "$DEST"; git init -q; git checkout -q -B main
  git add -A; git commit -q -m "foodweb-3d 本地工作副本（快照）"
  echo "    （git-subtree 不可用，已用无历史快照）"
fi

echo "==> [3/4] 本地工作文件夹就绪：$DEST"
echo "==> [4/4] 可选：安装依赖并自测"
rm -rf "$TMP"

cat <<EOF

✅ 本地工作文件夹已建立：
   $DEST

结构：根目录 = 16 篇文档 + README.md + DECISIONS.md + prototype/（软件）+ scripts/
下一步（可选）：
  cd "$DEST"
  open README.md                                  # 或用编辑器打开
  open prototype/index.artifact.html              # 浏览器看 3D 交互原型
  cd prototype && npm install && npm test          # 软件自测（需 Node ≥18，期望 9/9）

说明：这是纯本地 git 仓库，未连任何 GitHub 远端。
若之后要发布为独立 GitHub 私有仓库，见 scripts/MIGRATION-CHECKLIST.md。
EOF
