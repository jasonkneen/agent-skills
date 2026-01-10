# Workflow: Review Current Diff

<required_reading>

**Read these files NOW before proceeding:**

1. **CLAUDE.md** (if exists in project root) - Project-specific conventions
2. **references/review-checklist.md** - Review categories and priorities
3. **references/common-issues.md** - Patterns to watch for

</required_reading>

<process>

<step name="gather-context">

## Step 1: Gather Context

1. **Check for project conventions:**
   ```bash
   cat CLAUDE.md 2>/dev/null || echo "No CLAUDE.md found"
   ```

2. **Get the current diff:**
   ```bash
   git diff --stat
   git diff
   ```

3. **Understand what changed:**
   - Which files were modified?
   - What's the apparent purpose of these changes?
   - Are tests included?

</step>

<step name="categorize-changes">

## Step 2: Categorize Changes

Group the changes by type:
- **New code** - Additions that need full review
- **Modifications** - Changes to existing code (check for regressions)
- **Deletions** - Removed code (check nothing depends on it)
- **Refactoring** - Behavior should be unchanged
- **Config/Dependencies** - Check for security implications

</step>

<step name="review-critical">

## Step 3: Review Critical Issues First

Check for **🔴 Critical** issues:

1. **Security vulnerabilities:**
   - Hardcoded secrets?
   - Command/SQL injection?
   - Path traversal?
   - Missing auth checks?

2. **Data integrity risks:**
   - Missing transactions?
   - Race conditions?
   - Improper error handling?

**Stop and report critical issues immediately before continuing.**

</step>

<step name="review-bugs">

## Step 4: Review for Bugs

Check for **🟠 Bug** issues:

1. **Logic errors:**
   - Edge cases (null, empty, zero)?
   - Off-by-one errors?
   - Incorrect comparisons?

2. **Async issues:**
   - Floating promises?
   - Missing await?
   - Proper error propagation?

3. **Error handling:**
   - Errors caught appropriately?
   - Cleanup in finally blocks?

</step>

<step name="review-performance">

## Step 5: Review Performance

Check for **🟡 Performance** issues:

1. **Database:**
   - N+1 queries?
   - Missing indexes?
   - Unbounded queries?

2. **Memory:**
   - Event listener cleanup?
   - Large object lifecycle?

3. **Algorithms:**
   - Appropriate data structures?
   - Unnecessary work?

</step>

<step name="review-maintainability">

## Step 6: Review Maintainability

Check for **🔵 Maintainability** issues:

1. **Code clarity:**
   - Descriptive names?
   - Single responsibility?
   - No magic numbers?

2. **Project conventions:**
   - Follows CLAUDE.md rules?
   - Consistent with codebase patterns?

</step>

<step name="generate-report">

## Step 7: Generate Report

Format your review as:

```markdown
# Code Review: [Brief description of changes]

## Summary
[1-2 sentences about what the change does]

## 🔴 Critical Issues
[List critical issues with line numbers and fixes, or "None found"]

## 🟠 Bugs
[List potential bugs with line numbers and fixes, or "None found"]

## 🟡 Performance
[List performance concerns, or "None found"]

## 🔵 Maintainability
[List suggestions, or "Looks good"]

## ⚪ Style Notes
[Minor style suggestions, or skip this section]

## Verdict
- [ ] ✅ **Approve** - Good to merge
- [ ] 🔄 **Request Changes** - Needs fixes before merge
- [ ] ❓ **Questions** - Need clarification on intent
```

</step>

</process>

<anti_patterns>

## Avoid These Mistakes

- ❌ Reviewing without reading CLAUDE.md first
- ❌ Focusing on style before critical issues
- ❌ Being vague ("this could be better")
- ❌ Not providing specific fixes
- ❌ Reviewing unchanged code
- ❌ Bikeshedding on minor issues

</anti_patterns>

<success_criteria>

## Review is Complete When

- [ ] CLAUDE.md conventions checked (if exists)
- [ ] All changed files reviewed
- [ ] Critical/security issues addressed first
- [ ] Each issue has specific file:line reference
- [ ] Each issue has suggested fix
- [ ] Clear verdict provided

</success_criteria>
