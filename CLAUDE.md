# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build Commands
- Build all packages: `pnpm build`
- Build specific package: `cd packages/<name> && pnpm build`
- Dev mode (watch): `pnpm dev` or `cd packages/<name> && pnpm dev`
- Type check: `pnpm typecheck`
- Lint: `pnpm lint`
- Test: `pnpm test`
- Clean: `pnpm clean`

## Project Structure

This is a pnpm monorepo containing Claude Code extensions:

```
claude-skills/
├── packages/          # MCP servers (TypeScript, builds to dist/)
│   ├── mcp-github-issues/
│   └── mcp-debug-cycle/
├── skills/           # Agent Skills (SKILL.md format)
│   └── code-review/
└── hooks/            # Claude Code hooks (Node.js scripts)
    ├── cost-monitor/
    ├── notify-complete/
    └── tdd-enforcement/
```

## Architecture

### MCP Servers (`packages/`)

TypeScript packages following MCP SDK patterns:

- **Entry**: `src/index.ts` exports `Server` from `@modelcontextprotocol/sdk/server/index.js`
- **Tools**: `src/tools/*.ts` export `Tool` definitions and implementation functions
- **Utils**: `src/utils/*.ts` for shared logic (e.g., `gh-cli.ts` wraps GitHub CLI)
- **Build**: TypeScript compiles `src/` → `dist/`, using `tsconfig.base.json` + package-level `tsconfig.json`
- **Execution**: `dist/index.js` is the MCP server entry point (runs via `node`)

Tool implementations follow this pattern:
```typescript
export const toolName: Tool = {
  name: "mcp_tool_name",
  description: "...",
  inputSchema: { /* Zod or JSON Schema */ }
}

export async function toolName(args: ArgsType): Promise<ToolResponse> {
  // Implementation
}
```

### Agent Skills (`skills/`)

Agent Skills Specification (agentskills.io) compliant format:

- **Structure**: Each skill is a directory with `SKILL.md` as the manifest
- **Frontmatter**: YAML with required fields `name` (lowercase-hyphen only) and `description`
- **Content**: Markdown body with skill instructions, using XML-style tags for structure:
  - `<essential_principles>` - Core philosophy and rules
  - `<intake>` - User-facing prompt for skill invocation
  - `<routing>` - Pattern matching to workflow files
  - `<reference_index>` - Links to reference docs
  - `<workflows_index>` - Available workflow files
- **Supporting files**:
  - `references/` - On-demand docs (e.g., checklists, common issues)
  - `workflows/` - Step-by-step procedures (e.g., review-diff.md)
  - `scripts/` - Executable code (if needed)
  - `assets/` - Templates, data files

### Hooks (`hooks/`)

Node.js scripts triggered by Claude Code lifecycle events:

- **Structure**: Each hook is a directory with `hooks.json` (config) + `.js` (implementation)
- **Config**: `hooks.json` defines matcher (e.g., `"PostToolUse"`, `"Stop"`, `"PreToolUse"`)
- **Implementation**: Node.js script receives stdin with event data, performs action
- **Critical**: Use absolute paths in `hooks.json` command field (cwd resets between invocations)
- **State**: No in-memory persistence - load/save from files (e.g., `~/.claude/usage.json`)

## Key Patterns

### MCP Tool Safety
- **Shell injection prevention**: Use `execFile` not `exec` (see `gh-cli.ts`)
- **Input validation**: Zod schemas in tool definitions
- **Error handling**: Return `{ content: [...], isError: true }` for errors

### Agent Skills Compatibility
- **Naming**: Skill names must match directory name, lowercase-hyphen only
- **Progressive disclosure**: Keep SKILL.md body <5000 tokens, use `references/` for detail
- **Cross-agent**: SKILL.md format works across different AI agents (Claude, GPT, etc.)

### TypeScript Configuration
- **Base config**: `tsconfig.base.json` has strict mode, ES2022 target, NodeNext modules
- **Package configs**: Extend base, set `outDir: "dist"` and `rootDir: "src"`
- **Imports**: Use `.js` extensions in TypeScript imports (ES modules requirement)

## Development Workflow

### Adding a New MCP Server
1. Create `packages/mcp-<name>/` directory
2. Add `package.json` with `"type": "module"` and `@modelcontextprotocol/sdk` dependency
3. Create `src/index.ts` with Server setup
4. Create `src/tools/*.ts` for each tool
5. Add `tsconfig.json` extending `../../tsconfig.base.json`
6. Build with `pnpm build`
7. Test by adding to `~/.claude/settings.json` mcpServers config

### Adding a New Skill
1. Create `skills/<skill-name>/` directory
2. Create `SKILL.md` with frontmatter (name, description) and markdown body
3. Optional: Add `references/`, `workflows/`, `scripts/` subdirectories
4. Validate naming: lowercase-hyphen only, no consecutive hyphens
5. Install with `cp -r skills/<skill-name> ~/.claude/skills/`

### Adding a New Hook
1. Create `hooks/<hook-name>/` directory
2. Create `hooks.json` with matcher and absolute path to script
3. Create Node.js script that reads stdin, performs action
4. Use absolute paths for file operations (cwd is unstable)
5. Install by merging `hooks.json` into `~/.claude/hooks.json`

## Cross-Agent Compatibility

Skills in this repo follow the Agent Skills Specification (agentskills.io):

- **Portable format**: SKILL.md works across Claude, GPT, Gemini, etc.
- **No lock-in**: Markdown + YAML frontmatter, no proprietary JSON
- **Validation**: Can be validated with `skills-ref` tool
- **Distribution**: Can be shared via git, npm, or skill registries

When creating or modifying skills, ensure compatibility:
- Name matches directory (lowercase-hyphen)
- Description is clear and concise (<1024 chars)
- SKILL.md body uses semantic XML tags for structure
- References loaded on-demand, not inline

## Agent Skills Best Practices

### Required Fields
Every SKILL.md must include YAML frontmatter with:
```yaml
---
name: skill-name              # Required: lowercase-hyphen, matches directory
description: Clear description # Required: <1024 chars, what + when to use
---
```

### Optional but Recommended Fields
```yaml
---
name: skill-name
description: Clear description
version: 1.0.0               # Semver for version tracking
compatibility: Requires git CLI  # Dependencies/requirements
metadata:
  category: development      # Classification (development, creative, etc.)
  requires: git,node         # Tool dependencies
  platforms: claude-code,cursor,vscode  # Tested platforms
---
```

### Progressive Disclosure Model
Optimize for agent context efficiency:

1. **Metadata** (~100 tokens): Loaded at agent startup for discovery
2. **SKILL.md body** (<5000 tokens): Loaded when skill activates
3. **References** (on-demand): Loaded only when referenced
4. **Scripts** (as-needed): Executed when called

Keep SKILL.md under 500 lines; move details to `references/`.

### Directory Structure Best Practices

**Minimal (required)**:
```
skill-name/
└── SKILL.md
```

**Recommended**:
```
skill-name/
├── SKILL.md              # Core instructions (<500 lines)
├── references/           # On-demand documentation
│   ├── checklist.md      # Detailed checklists
│   └── examples.md       # Usage examples
├── workflows/            # Step-by-step procedures
│   ├── workflow-1.md
│   └── workflow-2.md
└── scripts/              # Optional automation
    ├── helper.sh
    └── formatter.js
```

**Keep references one level deep** - avoid deep nesting like `references/sub/deep/file.md`.

### XML-Style Structure Tags
Use semantic tags in SKILL.md body for clarity:

- `<essential_principles>` - Core philosophy and non-negotiable rules
- `<intake>` - User-facing prompt when skill invoked
- `<routing>` - Pattern matching to workflow files
- `<reference_index>` - Available reference docs
- `<workflows_index>` - Available workflow procedures
- `<scripts_index>` - Automation scripts (if any)
- `<anti_patterns>` - Common mistakes to avoid
- `<success_criteria>` - Checklist for completion

### What Makes a Good Skill

**Domain expertise**: Package specialized knowledge
```yaml
# Good: Specific, actionable domain knowledge
name: code-review
description: Automated code review against CLAUDE.md conventions

# Bad: Too generic, no clear domain
name: helper
description: Helps with stuff
```

**Repeatable workflows**: Enable consistent execution
```markdown
<process>
<step name="gather-context">
## Step 1: Gather Context
[Clear, numbered instructions]
</step>
</process>
```

**New capabilities**: Extend agent abilities
- Provide procedural knowledge agents lack
- Integrate external tools via scripts
- Capture organizational conventions

### Platform-Agnostic Design

**Do**:
- Use standard CLI tools (git, grep, sed)
- Write markdown instructions, not platform APIs
- Keep scripts in common languages (bash, python, node)
- Reference generic file paths (`./references/`, not `/Users/specific/path`)

**Don't**:
- Hardcode Claude-specific features
- Use proprietary APIs
- Assume specific IDE extensions
- Include absolute paths in skill files

### Scripts Directory (Optional)

When to add `scripts/`:
- Automating repetitive tasks (diff formatting, report generation)
- Integrating external tools (API calls, DB queries)
- Complex data transformations

Script guidelines:
- **Self-contained**: Document dependencies at top
- **Safe inputs**: Validate args, prevent injection
- **Clear output**: Structured, parseable results
- **Error handling**: Exit codes and messages

Example structure:
```bash
#!/usr/bin/env bash
# Description: What this script does
# Dependencies: git, jq
# Usage: ./script.sh <arg1> <arg2>

set -euo pipefail  # Fail fast

# Validate inputs
if [ $# -lt 2 ]; then
  echo "Usage: $0 <arg1> <arg2>"
  exit 1
fi

# Do work
# ...
```

### Common Mistakes to Avoid

1. **Generic names**: `helper`, `utils`, `misc` → Use specific, descriptive names
2. **Missing version**: No version field → Add semver for change tracking
3. **Platform lock-in**: Claude-specific code → Keep platform-agnostic
4. **Monolithic SKILL.md**: 1000+ lines → Split into references/workflows
5. **Deep nesting**: `references/sub/deep/file.md` → Keep one level deep
6. **Vague descriptions**: "Helps with code" → Specific what + when
7. **No compatibility info**: Unknown dependencies → Document requirements
8. **Inline everything**: No references/ → Use progressive disclosure

### Validation

Before publishing a skill:
1. **Name check**: Lowercase-hyphen, matches directory, no consecutive hyphens
2. **Frontmatter**: Valid YAML, required fields present
3. **Length**: SKILL.md <500 lines, description <1024 chars
4. **References**: One level deep, clear index in SKILL.md
5. **Platform test**: Works in Claude Code, Cursor, or VS Code
6. **No secrets**: No API keys, tokens, or credentials in files

Use `skills-ref` validation tool (from agentskills/agentskills repo) if available.

### Distribution

Skills are portable and can be shared via:
- **Git**: Version control, easy cloning
- **NPM**: Package for `npm install`
- **Skill registries**: Future centralized discovery
- **Direct copy**: `cp -r skill-name ~/.claude/skills/`

Include a README.md for installation instructions and examples.
