# Code Review Skill

## Purpose
Provide consistent, high-signal code reviews by focusing on correctness, clarity, maintainability, security, performance, tests, and developer experience.

## Inputs
- PR description and linked issues
- Code diffs and file context
- Existing conventions in the repository

## Review Checklist
### Correctness
- Does the change satisfy the requirements?
- Are edge cases handled?
- Are errors propagated/handled appropriately?

### Readability & Maintainability
- Is the code easy to follow?
- Are names clear and consistent?
- Is complexity justified?
- Are public APIs documented?

### Security
- Validate/encode untrusted input
- Avoid leaking secrets/PII
- Check authZ/authN boundaries

### Performance
- Watch for N+1 queries, unnecessary allocations, inefficient loops
- Ensure any tradeoffs are explained

### Testing
- Are tests added/updated?
- Do tests cover failure cases and boundaries?
- Are tests deterministic and fast?

### Style & Consistency
- Follows project lint/format rules
- No dead code or commented-out blocks

## Output Format
- Summary of change
- Key issues (must-fix)
- Suggestions (nice-to-have)
- Questions/uncertainties

## Tone
Be constructive and specific. Prefer actionable suggestions with examples.