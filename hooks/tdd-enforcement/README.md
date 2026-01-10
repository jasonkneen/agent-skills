# TDD Enforcement Hook

Forces test-driven development discipline by blocking edits to non-test files when TDD mode is active.

## How It Works

When TDD mode is enabled:
- ✅ Can edit test files (`*.test.ts`, `*.spec.js`, etc.)
- ✅ Can edit config files (`package.json`, `tsconfig.json`, etc.)
- ❌ Cannot edit source files until TDD mode is disabled

This enforces "red-green-refactor":
1. **Red**: Write failing test (allowed)
2. **Green**: Exit TDD mode, write implementation
3. **Refactor**: Clean up code

## Usage

### Enable TDD Mode
```bash
touch ~/.claude/tdd-mode
```

### Disable TDD Mode
```bash
rm ~/.claude/tdd-mode
```

### Check Status
```bash
[ -f ~/.claude/tdd-mode ] && echo "TDD mode ON" || echo "TDD mode OFF"
```

## Installation

Add to `~/.claude/hooks.json`:

```json
{
  "hooks": [
    {
      "matcher": "PreToolUse",
      "hooks": [
        {
          "type": "command",
          "command": "node /path/to/tdd-guard.js"
        }
      ]
    }
  ]
}
```

## Test File Patterns

Recognized as test files:
- `*.test.ts`, `*.test.tsx`, `*.test.js`, `*.test.jsx`
- `*.spec.ts`, `*.spec.tsx`, `*.spec.js`, `*.spec.jsx`
- `*_test.py`, `test_*.py`
- `*_spec.rb`
- `*Test.java`, `*Tests.cs`
- Files in `__tests__/`, `tests/`, `test/`, `spec/` directories

## Always Allowed

These files can always be edited (config):
- `package.json`, `tsconfig.json`
- `.eslintrc*`, `.prettierrc*`
- `jest.config.*`, `vitest.config.*`
- `.env*`

## Example

```
$ claude "add a new helper function"

🛑 TDD Mode: Blocked edit to "helpers.ts"
   Only test files can be edited in TDD mode.
   To disable: rm ~/.claude/tdd-mode
   Or finish writing tests first!
```
