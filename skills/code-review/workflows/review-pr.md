# Workflow: Review Pull Request

<required_reading>

**Read these files NOW before proceeding:**

1. **CLAUDE.md** (if exists) - Project-specific conventions
2. **references/review-checklist.md** - Review categories
3. **references/common-issues.md** - Patterns to watch for

</required_reading>

<process>

<step name="fetch-pr">

## Step 1: Fetch PR Details

Use the GitHub Issues MCP (if available) or gh CLI:

```bash
# Get PR details
gh pr view <PR_NUMBER> --json title,body,files,additions,deletions,baseRefName,headRefName

# Get the diff
gh pr diff <PR_NUMBER>
```

Note:
- PR number from user input
- If no number provided, check for current branch PR

</step>

<step name="understand-context">

## Step 2: Understand Context

1. **Read PR description** - What is this PR trying to accomplish?
2. **Check linked issues** - Is there context in related issues?
3. **Review file list** - Which areas of codebase are affected?
4. **Check PR size** - Large PRs may need to be broken down

Size guidance:
- **Small** (<100 lines): Quick review
- **Medium** (100-500 lines): Standard review
- **Large** (>500 lines): Consider suggesting split

</step>

<step name="check-conventions">

## Step 3: Check Project Conventions

If CLAUDE.md exists:
1. Read project conventions
2. Note specific rules for this file type
3. Check for required patterns

Common checks:
- [ ] Follows naming conventions
- [ ] Imports organized correctly
- [ ] Tests included (if required)
- [ ] Documentation updated (if required)

</step>

<step name="review-changes">

## Step 4: Review Changes by Priority

### 🔴 Critical (Security/Data)
- Authentication/authorization
- Input validation
- Data handling
- Error exposure

### 🟠 Bugs (Logic)
- Edge cases
- Error handling
- Async patterns
- State management

### 🟡 Performance
- Database queries
- Memory management
- Algorithm efficiency

### 🔵 Maintainability
- Code clarity
- DRY violations
- Test coverage

</step>

<step name="check-tests">

## Step 5: Review Tests

- [ ] Tests exist for new functionality
- [ ] Tests cover edge cases
- [ ] Tests are meaningful (not just coverage)
- [ ] Existing tests still pass

If tests missing:
```markdown
**Missing Tests:**
- [ ] Test for [specific scenario]
- [ ] Edge case: [empty input / null / etc]
```

</step>

<step name="generate-review">

## Step 6: Generate PR Review

Format output as:

```markdown
# PR Review: #<NUMBER> - <TITLE>

## Summary
[Brief description of what this PR does]

## Overall Assessment
- [ ] ✅ **Approve** - Ready to merge
- [ ] 🔄 **Request Changes** - Issues need addressing
- [ ] 💬 **Comment** - Questions/suggestions only

## 🔴 Critical Issues
[Must fix before merge]

## 🟠 Bugs/Concerns
[Should fix]

## 🟡 Suggestions
[Nice to have]

## 📝 Inline Comments

### `path/to/file.ts:42`
```typescript
// Problematic code
```
**Issue:** [Description]
**Suggestion:** [Fix]

---

## Tests
- [ ] Adequate coverage
- [ ] Edge cases covered
- [ ] [Specific missing test]

## Documentation
- [ ] README updated (if needed)
- [ ] API docs updated (if needed)
- [ ] Comments adequate
```

</step>

</process>

<anti_patterns>

## Avoid These Mistakes

- ❌ Reviewing without understanding PR purpose
- ❌ Nitpicking style over substance
- ❌ Not checking for missing tests
- ❌ Approving without reading all files
- ❌ Focusing on unchanged code
- ❌ Vague feedback ("this could be better")

</anti_patterns>

<success_criteria>

## Review is Complete When

- [ ] PR description understood
- [ ] All changed files reviewed
- [ ] Critical issues identified first
- [ ] Each comment has specific file:line
- [ ] Each issue has suggested fix
- [ ] Test coverage assessed
- [ ] Clear approve/request changes verdict

</success_criteria>
