# Workflow: Review Branch Comparison

Compare two branches to review all changes.

<required_reading>

**Read these files NOW:**

1. **CLAUDE.md** (if exists) - Project conventions
2. **references/review-checklist.md** - Review categories

</required_reading>

<process>

<step name="get-branches">

## Step 1: Identify Branches

```bash
# Current branch
git branch --show-current

# Compare branches (default: main)
git log --oneline main..<BRANCH>

# Full diff
git diff main..<BRANCH> --stat
```

If no branches specified:
- Source: current branch
- Target: main (or master)

</step>

<step name="review-commits">

## Step 2: Review Commit History

```bash
# Show commits in branch
git log main..<BRANCH> --oneline

# Show detailed commits
git log main..<BRANCH> --pretty=format:"%h %s" --no-merges
```

Check:
- [ ] Commits are logical units
- [ ] Commit messages are clear
- [ ] No "WIP" or "fix" only commits
- [ ] Squash candidates identified

</step>

<step name="review-diff">

## Step 3: Review Full Diff

```bash
git diff main..<BRANCH>
```

Apply standard review process:
1. Critical issues first
2. Bugs second
3. Performance third
4. Style last

</step>

<step name="generate-report">

## Step 4: Generate Report

```markdown
# Branch Review: `<BRANCH>` → `main`

## Summary
- **Commits:** <N>
- **Files Changed:** <N>
- **Additions:** +<N>
- **Deletions:** -<N>

## Commit Quality
- [ ] Commits are atomic
- [ ] Messages are descriptive
- [ ] History is clean

### Squash Recommendations
[If any commits should be combined]

## Code Review

### 🔴 Critical Issues
[Must fix before merge]

### 🟠 Bugs
[Should fix]

### 🟡 Suggestions
[Nice to have]

## Files Changed
| File | +/- | Notes |
|------|-----|-------|
| path/file.ts | +50/-10 | [brief note] |

## Ready to Merge?
- [ ] ✅ **Yes** - Approve
- [ ] 🔄 **Almost** - Minor fixes
- [ ] ❌ **No** - Significant issues
```

</step>

</process>

<success_criteria>

- [ ] All commits reviewed
- [ ] Full diff reviewed
- [ ] Issues prioritized
- [ ] Merge readiness assessed

</success_criteria>
