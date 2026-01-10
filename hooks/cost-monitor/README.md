# Cost Monitor Hook

Tracks Claude Code token usage per tool call and warns when approaching daily limits.

## Features

- 📊 Tracks tokens used per tool call
- ⚠️ Warns at 80% of daily limit
- 📁 Logs to `~/.claude/usage.json` for analysis
- 🔄 Auto-resets daily counters

## Installation

### Option 1: Add to project hooks

Add to your project's `.claude/hooks.json`:

```json
{
  "hooks": [
    {
      "matcher": "PostToolUse",
      "hooks": [
        {
          "type": "command",
          "command": "node /path/to/cost-monitor.js"
        }
      ]
    }
  ]
}
```

### Option 2: Add to global hooks

Add to `~/.claude/hooks.json` for all projects.

## Configuration

Edit `cost-monitor.js` to adjust:

```javascript
const WARN_THRESHOLD = 0.8    // Warn at 80%
const DAILY_TOKEN_LIMIT = 100000  // Your plan's limit
```

## Usage Data

View your usage:

```bash
cat ~/.claude/usage.json | jq .
```

Example output:

```json
{
  "daily": {
    "2025-01-15": {
      "totalTokens": 45000,
      "toolCalls": 150,
      "byTool": {
        "Read": { "calls": 50, "tokens": 20000 },
        "Bash": { "calls": 30, "tokens": 15000 },
        "Write": { "calls": 20, "tokens": 10000 }
      }
    }
  },
  "lastReset": "2025-01-15"
}
```

## Token Estimation

Uses rough heuristic: ~4 characters per token. This is an estimate, not exact billing data.
