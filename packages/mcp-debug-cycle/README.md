# Debug Cycle MCP Server

Automate the "add logs → run → analyze → cleanup" debugging cycle.

## Tools

### `debug_add_logs`
Add debug logging to a file at specified locations.

```json
{
  "file_path": "src/service.ts",
  "locations": [
    { "line": 42, "message": "entering processUser", "variables": ["userId", "data"] },
    { "line": 56, "message": "after validation", "variables": ["isValid"] }
  ]
}
```

Supports: TypeScript/JavaScript, Python, Ruby, Go, Java

### `debug_remove_logs`
Remove all auto-generated debug logs from a file.

```json
{
  "file_path": "src/service.ts",
  "dry_run": true
}
```

### `debug_capture_output`
Run a command and capture output for analysis.

```json
{
  "command": "npm",
  "args": ["test"],
  "filter_debug": true
}
```

### `debug_analyze_output`
Analyze captured output for errors and patterns.

```json
{
  "focus": "errors",
  "search_pattern": "userId.*undefined"
}
```

## Workflow Example

1. **Add logs** to suspect function
2. **Run tests** and capture output
3. **Analyze** captured output
4. **Fix** the issue
5. **Remove logs** to clean up

```bash
# Via Claude Code
"Add debug logs to src/auth.ts around the login function"
"Run npm test and capture output"
"Analyze the debug output for errors"
"Remove all debug logs from src/auth.ts"
```

## Installation

```json
// ~/.claude/settings.json
{
  "mcpServers": {
    "debug-cycle": {
      "command": "node",
      "args": ["/path/to/mcp-debug-cycle/dist/index.js"]
    }
  }
}
```

## Output Location

Captured outputs saved to: `~/.claude/debug-captures/`
