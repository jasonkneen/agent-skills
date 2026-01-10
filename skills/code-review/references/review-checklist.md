# Code Review Checklist

## 🔴 Critical (Must Fix)

### Security
- [ ] No hardcoded secrets, API keys, or passwords
- [ ] Input validation on all user-provided data
- [ ] SQL queries use parameterized statements
- [ ] No command injection vulnerabilities (use execFile, not shell strings)
- [ ] Authentication/authorization checks in place
- [ ] Sensitive data not logged or exposed in errors
- [ ] HTTPS enforced for external requests

### Data Integrity
- [ ] Database transactions for multi-step operations
- [ ] Proper error handling that doesn't corrupt state
- [ ] Backup/rollback strategy for destructive operations
- [ ] No race conditions in concurrent code

---

## 🟠 Bugs (Should Fix)

### Logic
- [ ] Edge cases handled (empty arrays, null values, zero)
- [ ] Off-by-one errors checked
- [ ] Proper boolean logic (De Morgan's laws)
- [ ] Correct comparison operators (== vs ===)
- [ ] Async/await properly used (no floating promises)

### Error Handling
- [ ] Errors caught and handled appropriately
- [ ] Error messages are helpful for debugging
- [ ] Cleanup happens even on error (finally blocks)
- [ ] No swallowed exceptions

---

## 🟡 Performance (Consider Fixing)

### Database
- [ ] No N+1 query patterns
- [ ] Proper indexes exist for query patterns
- [ ] Pagination for large result sets
- [ ] Connection pooling configured

### Memory
- [ ] No memory leaks (event listeners cleaned up)
- [ ] Large objects garbage collected when done
- [ ] Streams used for large file operations
- [ ] Caching strategy appropriate

### Algorithms
- [ ] Appropriate data structures chosen
- [ ] No unnecessary iterations
- [ ] Early returns to avoid work
- [ ] Expensive operations cached or memoized

---

## 🔵 Maintainability (Nice to Fix)

### Clarity
- [ ] Functions do one thing
- [ ] Variable names describe content
- [ ] Function names describe behavior
- [ ] Complex logic has explanatory comments
- [ ] No magic numbers (use named constants)

### Structure
- [ ] DRY - no significant code duplication
- [ ] Single Responsibility Principle followed
- [ ] Dependencies injected, not hardcoded
- [ ] Testable code structure

### Documentation
- [ ] Public APIs documented
- [ ] Complex algorithms explained
- [ ] README updated if behavior changed
- [ ] Breaking changes documented

---

## ⚪ Style (Optional)

### Formatting
- [ ] Consistent indentation
- [ ] Line length reasonable
- [ ] Import organization consistent
- [ ] No trailing whitespace

### Conventions
- [ ] Naming follows project conventions
- [ ] File organization matches patterns
- [ ] TypeScript types explicit where needed
- [ ] ESLint/Prettier rules followed
