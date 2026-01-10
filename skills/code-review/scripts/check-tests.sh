#!/usr/bin/env bash
# Check if changes include test coverage

set -euo pipefail

MODE="${1:-unstaged}"

echo "=== Test Coverage Check ==="
echo ""

# Get list of changed files
case "$MODE" in
  unstaged|diff)
    CHANGED_FILES=$(git diff --name-only)
    ;;
  staged)
    CHANGED_FILES=$(git diff --staged --name-only)
    ;;
  *)
    echo "Usage: $0 [unstaged|staged]"
    exit 1
    ;;
esac

if [ -z "$CHANGED_FILES" ]; then
  echo "No changed files found"
  exit 0
fi

# Filter source files (not tests, not config)
SOURCE_FILES=$(echo "$CHANGED_FILES" | grep -vE '\.(test|spec)\.(ts|js|tsx|jsx|py|rb)$|^test/|^tests/|^__tests__/|\.config\.|\.json$|\.md$' || true)

if [ -z "$SOURCE_FILES" ]; then
  echo "✅ Only tests and config files changed"
  exit 0
fi

echo "📝 Changed source files:"
echo "$SOURCE_FILES" | sed 's/^/  - /'
echo ""

# Check if corresponding test files exist or were modified
MISSING_TESTS=""
for file in $SOURCE_FILES; do
  # Try multiple test file patterns
  DIR=$(dirname "$file")
  BASE=$(basename "$file" | sed -E 's/\.(ts|js|tsx|jsx|py|rb)$//')
  EXT="${file##*.}"

  # Common test patterns
  TEST_PATTERNS=(
    "${DIR}/${BASE}.test.${EXT}"
    "${DIR}/${BASE}.spec.${EXT}"
    "${DIR}/__tests__/${BASE}.test.${EXT}"
    "test/${DIR}/${BASE}.test.${EXT}"
    "tests/${DIR}/${BASE}.test.${EXT}"
  )

  FOUND=false
  for pattern in "${TEST_PATTERNS[@]}"; do
    if [ -f "$pattern" ]; then
      FOUND=true
      # Check if test file was also modified
      if echo "$CHANGED_FILES" | grep -q "^${pattern}$"; then
        echo "✅ $file (test updated: $pattern)"
      else
        echo "⚠️  $file (test exists but not updated: $pattern)"
      fi
      break
    fi
  done

  if [ "$FOUND" = false ]; then
    echo "❌ $file (no test file found)"
    MISSING_TESTS="${MISSING_TESTS}${file}\n"
  fi
done

echo ""
if [ -n "$MISSING_TESTS" ]; then
  echo "⚠️  Warning: Some source files have no test coverage"
  exit 1
else
  echo "✅ All source files have test coverage"
fi
