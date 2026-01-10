# Workflow: Review Staged Changes

Review changes that are staged for commit (git add).

<required_reading>

**Read these files NOW:**

1. **CLAUDE.md** (if exists) - Project conventions
2. **references/review-checklist.md** - Review categories

</required_reading>

<process>

<step name="get-staged">

## Step 1: Get Staged Changes

```bash
# Show staged files
git diff --staged --stat

# Show staged diff
git diff --staged
```

</step>

<step name="quick-review">

## Step 2: Quick Pre-Commit Review

Focus on commit-blocking issues:

### Must Check
- [ ] No secrets/credentials staged
- [ ] No debug code (console.log, debugger)
- [ ] No commented-out code blocks
- [ ] No TODO without issue reference
- [ ] File names follow conventions

### Should Check
- [ ] Imports cleaned up
- [ ] No unused variables
- [ ] Error handling present
- [ ] Types explicit (TypeScript)

</step>

<step name="generate-feedback">

## Step 3: Generate Feedback

```markdown
# Staged Changes Review

## Ready to Commit?
- [ ] ✅ **Yes** - Looks good
- [ ] ⚠️ **Almost** - Minor fixes needed
- [ ] ❌ **No** - Issues found

## Issues Found
[List any blocking issues]

## Suggestions
[Optional improvements]

## Recommended Commit Message
```
<type>(<scope>): <description>

[body if needed]
```
```

</step>

</process>

<success_criteria>

- [ ] No secrets staged
- [ ] No debug code
- [ ] Changes are intentional
- [ ] Commit message suggested

</success_criteria>
