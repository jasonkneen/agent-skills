#!/usr/bin/env bash
# Get formatted git diff for code review

set -euo pipefail

MODE="${1:-unstaged}"

case "$MODE" in
  unstaged|diff)
    echo "=== Unstaged Changes ==="
    git diff --stat
    echo ""
    git diff
    ;;
  staged)
    echo "=== Staged Changes ==="
    git diff --staged --stat
    echo ""
    git diff --staged
    ;;
  branch)
    BRANCH="${2:-main}"
    echo "=== Changes vs $BRANCH ==="
    git diff "$BRANCH"...HEAD --stat
    echo ""
    git diff "$BRANCH"...HEAD
    ;;
  *)
    echo "Usage: $0 [unstaged|staged|branch] [branch-name]"
    echo ""
    echo "Examples:"
    echo "  $0                    # Show unstaged changes"
    echo "  $0 staged             # Show staged changes"
    echo "  $0 branch main        # Compare with main branch"
    exit 1
    ;;
esac
