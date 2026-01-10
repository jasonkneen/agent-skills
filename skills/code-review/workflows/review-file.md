# Workflow: Review Specific File

Deep review of a single file.

<required_reading>

**Read these files NOW:**

1. **CLAUDE.md** (if exists) - Project conventions
2. **references/review-checklist.md** - Full checklist
3. **references/common-issues.md** - Patterns to watch

</required_reading>

<process>

<step name="read-file">

## Step 1: Read the File

```bash
# Read the specified file
cat <FILE_PATH>

# Check git history for context
git log --oneline -10 <FILE_PATH>
```

</step>

<step name="understand-purpose">

## Step 2: Understand Purpose

- What does this file do?
- What is its role in the system?
- What are its dependencies?
- Who are its dependents?

</step>

<step name="deep-review">

## Step 3: Deep Review

### Structure
- [ ] Single responsibility
- [ ] Logical organization
- [ ] Appropriate file size
- [ ] Clear exports

### Code Quality
- [ ] Functions are focused
- [ ] Names are descriptive
- [ ] Comments explain why
- [ ] No magic numbers
- [ ] DRY principle followed

### Security
- [ ] Input validation
- [ ] Safe data handling
- [ ] No hardcoded secrets
- [ ] Proper error messages

### Performance
- [ ] No obvious inefficiencies
- [ ] Appropriate data structures
- [ ] Resource cleanup

### Testing
- [ ] Test file exists
- [ ] Edge cases covered
- [ ] Mocks appropriate

</step>

<step name="generate-report">

## Step 4: Generate Report

```markdown
# File Review: `<FILE_PATH>`

## Purpose
[What this file does]

## Overall Health: [🟢 Good / 🟡 Needs Work / 🔴 Problematic]

## Issues Found

### 🔴 Critical
[Security/data issues]

### 🟠 Bugs
[Logic issues]

### 🟡 Improvements
[Performance/maintainability]

## Specific Recommendations

### Line <N>
```code
// problematic code
```
**Issue:** [description]
**Fix:** [suggestion]

## Test Coverage
[Assessment of test file if exists]

## Refactoring Suggestions
[Larger structural improvements if needed]
```

</step>

</process>

<success_criteria>

- [ ] File purpose understood
- [ ] All code sections reviewed
- [ ] Issues prioritized
- [ ] Specific line references
- [ ] Actionable suggestions

</success_criteria>
