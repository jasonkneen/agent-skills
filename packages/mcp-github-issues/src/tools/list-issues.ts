import { Tool } from "@modelcontextprotocol/sdk/types.js"
import { gh, formatRepo, ToolResult } from "../utils/gh-cli.js"

export const listIssuesTool: Tool = {
  name: "github_list_issues",
  description:
    "List GitHub issues with optional filters for state, labels, assignee, and author",
  inputSchema: {
    type: "object",
    properties: {
      owner: {
        type: "string",
        description: "Repository owner (e.g., 'anthropics')",
      },
      repo: {
        type: "string",
        description: "Repository name (e.g., 'claude-code')",
      },
      state: {
        type: "string",
        enum: ["open", "closed", "all"],
        description: "Filter by issue state (default: open)",
        default: "open",
      },
      labels: {
        type: "array",
        items: { type: "string" },
        description: "Filter by labels",
      },
      assignee: {
        type: "string",
        description: "Filter by assignee username",
      },
      author: {
        type: "string",
        description: "Filter by author username",
      },
      limit: {
        type: "number",
        description: "Maximum number of issues to return (default: 30, max: 100)",
        default: 30,
      },
    },
    required: ["owner", "repo"],
  },
}

interface GitHubIssueListItem {
  number: number
  title: string
  state: string
  labels: Array<{ name: string }>
  author: { login: string }
  createdAt: string
  updatedAt: string
}

export interface ListIssuesArgs {
  owner: string
  repo: string
  state?: "open" | "closed" | "all"
  labels?: string[]
  assignee?: string
  author?: string
  limit?: number
}

export async function listIssues(args: ListIssuesArgs): Promise<ToolResult> {
  const {
    owner,
    repo,
    state = "open",
    labels,
    assignee,
    author,
    limit = 30,
  } = args

  const ghArgs = [
    "issue",
    "list",
    "-R",
    formatRepo(owner, repo),
    "--state",
    state,
    "--limit",
    String(Math.min(limit, 100)),
    "--json",
    "number,title,state,labels,author,createdAt,updatedAt",
  ]

  if (labels?.length) {
    ghArgs.push("--label", labels.join(","))
  }

  if (assignee) {
    ghArgs.push("--assignee", assignee)
  }

  if (author) {
    ghArgs.push("--author", author)
  }

  const result = await gh<GitHubIssueListItem[]>(ghArgs)

  if (!result.success || !result.data) {
    return {
      content: [{
        type: "text",
        text: `Failed to list issues: ${result.error || "No data returned"}`
      }],
      isError: true,
    }
  }

  const issues = result.data

  if (issues.length === 0) {
    return {
      content: [{ type: "text", text: "No issues found matching the criteria." }],
    }
  }

  let output = `# Issues in ${owner}/${repo} (${issues.length} results)\n\n`
  output += `| # | Title | State | Labels | Author | Updated |\n`
  output += `|---|-------|-------|--------|--------|----------|\n`

  for (const issue of issues) {
    const labelsList = issue.labels.map((l) => l.name).join(", ") || "-"
    const updated = new Date(issue.updatedAt).toLocaleDateString()
    output += `| #${issue.number} | ${issue.title.slice(0, 50)}${issue.title.length > 50 ? "..." : ""} | ${issue.state} | ${labelsList} | @${issue.author.login} | ${updated} |\n`
  }

  return {
    content: [{ type: "text", text: output }],
  }
}
