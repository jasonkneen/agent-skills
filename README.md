# Claude Skills

Collection of Claude Code skills, MCP servers, and hooks for enhanced productivity.

## Components

### MCP Servers

| Server | Description | Status |
|--------|-------------|--------|
| [mcp-github-issues](./packages/mcp-github-issues/) | Fetch GitHub issues and PRs | ✅ Ready |
| [mcp-debug-cycle](./packages/mcp-debug-cycle/) | Automated debug instrumentation | ✅ Ready |

### Skills

| Skill | Description | Status |
|-------|-------------|--------|
| [code-review](./skills/code-review/) | Automated code review against CLAUDE.md | ✅ Ready |

### Hooks

| Hook | Description | Status |
|------|-------------|--------|
| [cost-monitor](./hooks/cost-monitor/) | Track token usage, warn at limits | ✅ Ready |
| [notify-complete](./hooks/notify-complete/) | OS notification on task completion | ✅ Ready |
| [tdd-enforcement](./hooks/tdd-enforcement/) | Block non-test edits in TDD mode | ✅ Ready |

## Quick Start

```bash
# Clone and build
git clone https://github.com/jkneen/claude-skills.git
cd claude-skills
pnpm install
pnpm build
```

### Install MCP Servers

Add to `~/.claude/settings.json`:

```json
{
  "mcpServers": {
    "github-issues": {
      "command": "node",
      "args": ["/path/to/claude-skills/packages/mcp-github-issues/dist/index.js"]
    },
    "debug-cycle": {
      "command": "node",
      "args": ["/path/to/claude-skills/packages/mcp-debug-cycle/dist/index.js"]
    }
  }
}
```

### Install Skill

```bash
cp -r skills/code-review ~/.claude/skills/
```

### Install Hooks

Add to `~/.claude/hooks.json`:

```json
{
  "hooks": [
    {
      "matcher": "PostToolUse",
      "hooks": [{ "type": "command", "command": "node /path/to/hooks/cost-monitor/cost-monitor.js" }]
    },
    {
      "matcher": "Stop",
      "hooks": [{ "type": "command", "command": "node /path/to/hooks/notify-complete/notify.js" }]
    },
    {
      "matcher": "PreToolUse",
      "hooks": [{ "type": "command", "command": "node /path/to/hooks/tdd-enforcement/tdd-guard.js" }]
    }
  ]
}
```

## MCP Server Details

### GitHub Issues MCP

Tools:
- `github_get_issue` - Fetch issue by number with comments
- `github_list_issues` - List/filter issues
- `github_get_pr` - Fetch PR with diff summary
- `github_search_issues` - Full-text search

### Debug Cycle MCP

Tools:
- `debug_add_logs` - Add instrumentation to files
- `debug_remove_logs` - Clean up debug logs
- `debug_capture_output` - Run command, capture output
- `debug_analyze_output` - Analyze captured logs

## Hook Details

### Cost Monitor
Tracks tokens per tool call, warns at 80% of daily limit. Logs to `~/.claude/usage.json`.

### Notify Complete
OS notification (macOS/Linux/Windows) when Claude completes a task.

### TDD Enforcement
When `~/.claude/tdd-mode` exists, blocks edits to non-test files. Forces test-first discipline.

## Development

```bash
pnpm install     # Install dependencies
pnpm build       # Build all packages
pnpm typecheck   # Type check
```

## Roadmap

### P2 - Planned
- Jira/Linear Integration
- CLAUDE.md Auto-Learning

### P3 - Future
- Context Management MCP
- Parallel Task Orchestration

## License

MIT
