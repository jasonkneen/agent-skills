#!/usr/bin/env bash
# Generate code review report template

set -euo pipefail

TITLE="${1:-Code Review}"

cat <<EOF
# Code Review: $TITLE

## Summary
[1-2 sentences describing what this change does]

## Files Changed
$(git diff --stat 2>/dev/null | tail -1 || echo "No changes detected")

## 🔴 Critical Issues
- [ ] None found

## 🟠 Bugs
- [ ] None found

## 🟡 Performance
- [ ] None found

## 🔵 Maintainability
- [ ] Looks good

## ⚪ Style Notes
[Minor style suggestions, or skip this section]

## Verdict
- [ ] ✅ **Approve** - Good to merge
- [ ] 🔄 **Request Changes** - Needs fixes before merge
- [ ] ❓ **Questions** - Need clarification on intent

---

## Review Checklist

### Security
- [ ] No hardcoded secrets or credentials
- [ ] No SQL/command injection vulnerabilities
- [ ] No path traversal risks
- [ ] Authentication/authorization properly checked

### Logic
- [ ] Edge cases handled (null, empty, zero)
- [ ] Error handling appropriate
- [ ] Async operations properly awaited
- [ ] No race conditions

### Performance
- [ ] No N+1 database queries
- [ ] Memory leaks prevented
- [ ] Appropriate algorithms and data structures
- [ ] Event listeners properly cleaned up

### Maintainability
- [ ] Follows project conventions (CLAUDE.md)
- [ ] Code is clear and self-documenting
- [ ] Single responsibility principle followed
- [ ] Tests included and passing

### Style
- [ ] Consistent naming conventions
- [ ] No magic numbers
- [ ] Proper indentation and formatting
- [ ] No commented-out code
EOF
