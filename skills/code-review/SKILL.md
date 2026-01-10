---
name: code-review
description: Automated code review against project conventions (CLAUDE.md) and best practices
version: 1.0.0
compatibility: Requires git CLI
metadata:
  category: development
  requires: git
  platforms: claude-code,cursor,vscode,github-copilot
---

<essential_principles>

## Core Philosophy

Code review should be:
1. **Convention-aware** - Follows project-specific rules from CLAUDE.md
2. **Actionable** - Every comment includes a specific fix
3. **Prioritized** - Critical issues first, style last
4. **Contextual** - Understands the change's purpose

## Review Categories (Priority Order)

1. **🔴 Critical** - Security vulnerabilities, data loss risks, crashes
2. **🟠 Bugs** - Logic errors, edge cases, race conditions
3. **🟡 Performance** - N+1 queries, memory leaks, inefficient algorithms
4. **🔵 Maintainability** - Code clarity, naming, documentation
5. **⚪ Style** - Formatting, conventions, nitpicks

## Key Rules

- **NEVER approve code you haven't read**
- **ALWAYS read CLAUDE.md first** if it exists
- **Spawn fresh context** for large reviews to avoid bias
- **Be specific** - line numbers, code snippets, fixes
- **Stay focused** - review what changed, not the whole file

</essential_principles>

<intake>

# Code Review

What would you like to review?

1. **Current diff** - Review uncommitted changes (`git diff`)
2. **Staged changes** - Review staged changes (`git diff --staged`)
3. **PR by number** - Review a specific pull request
4. **Specific file** - Review a single file in depth
5. **Branch comparison** - Compare two branches

**Enter your choice or describe what you want reviewed:**

</intake>

<routing>

| Response Pattern | Workflow |
|------------------|----------|
| "1", "current", "diff", "changes" | workflows/review-diff.md |
| "2", "staged" | workflows/review-staged.md |
| "3", "pr", "#\d+", "pull request" | workflows/review-pr.md |
| "4", "file", specific filepath | workflows/review-file.md |
| "5", "branch", "compare" | workflows/review-branch.md |

</routing>

<reference_index>

## References

- **references/review-checklist.md** - Comprehensive checklist by category
- **references/common-issues.md** - Frequently found problems and fixes
- **references/security-patterns.md** - Security vulnerabilities to watch for

</reference_index>

<workflows_index>

## Available Workflows

1. **review-diff.md** - Review current uncommitted changes
2. **review-staged.md** - Review staged changes before commit
3. **review-pr.md** - Review a pull request by number
4. **review-file.md** - Deep review of a specific file
5. **review-branch.md** - Compare branches

</workflows_index>

<scripts_index>

## Automation Scripts

Optional helper scripts for code review tasks:

- **scripts/get-diff.sh** - Get formatted git diff (unstaged/staged/branch)
- **scripts/check-tests.sh** - Verify test coverage for changed files
- **scripts/format-report.sh** - Generate review report template

Usage:
```bash
# Get diff
./scripts/get-diff.sh [unstaged|staged|branch] [branch-name]

# Check test coverage
./scripts/check-tests.sh [unstaged|staged]

# Generate report template
./scripts/format-report.sh "Feature Name"
```

</scripts_index>
