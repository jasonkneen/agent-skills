#!/usr/bin/env bash
set -euo pipefail

# Sync the canonical skills/ directory into both GitHub and Claude skill locations.

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

SRC_DIR="$ROOT_DIR/skills/"
GITHUB_SKILLS_DIR="$ROOT_DIR/.github/skills/"
CLAUDE_SKILLS_DIR="$ROOT_DIR/.claude/skills/"

mkdir -p "$GITHUB_SKILLS_DIR" "$CLAUDE_SKILLS_DIR"

rsync -a --delete "$SRC_DIR" "$GITHUB_SKILLS_DIR"
rsync -a --delete "$SRC_DIR" "$CLAUDE_SKILLS_DIR"
