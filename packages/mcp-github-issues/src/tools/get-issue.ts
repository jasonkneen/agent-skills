import { Tool } from "@modelcontextprotocol/sdk/types.js"
import { gh, formatRepo, ToolResult } from "../utils/gh-cli.js"

export const getIssueTool: Tool = {
  name: "github_get_issue",
  description:
    "Fetch a GitHub issue by number, including title, body, labels, assignees, and comments",
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
      issue_number: {
        type: "number",
        description: "Issue number to fetch",
      },
      include_comments: {
        type: "boolean",
        description: "Include issue comments (default: true)",
        default: true,
      },
    },
    required: ["owner", "repo", "issue_number"],
  },
}

interface GitHubIssue {
  number: number
  title: string
  body: string
  state: string
  labels: Array<{ name: string }>
  assignees: Array<{ login: string }>
  author: { login: string }
  createdAt: string
  updatedAt: string
  comments: Array<{
    author: { login: string }
    body: string
    createdAt: string
  }>
  url: string
}

export interface GetIssueArgs {
  owner: string
  repo: string
  issue_number: number
  include_comments?: boolean
}

export async function getIssue(args: GetIssueArgs): Promise<ToolResult> {
  const { owner, repo, issue_number, include_comments = true } = args

  const fields = [
    "number",
    "title",
    "body",
    "state",
    "labels",
    "assignees",
    "author",
    "createdAt",
    "updatedAt",
    "url",
  ]

  if (include_comments) {
    fields.push("comments")
  }

  const result = await gh<GitHubIssue>([
    "issue",
    "view",
    String(issue_number),
    "-R",
    formatRepo(owner, repo),
    "--json",
    fields.join(","),
  ])

  if (!result.success || !result.data) {
    return {
      content: [{
        type: "text",
        text: `Failed to fetch issue: ${result.error || "No data returned"}`
      }],
      isError: true,
    }
  }

  const issue = result.data

  // Format for readability
  const labelsList = issue.labels.map((l) => l.name).join(", ") || "none"
  const assigneesList = issue.assignees.map((a) => a.login).join(", ") || "unassigned"

  let output = `# Issue #${issue.number}: ${issue.title}

**State:** ${issue.state}
**Author:** @${issue.author.login}
**Labels:** ${labelsList}
**Assignees:** ${assigneesList}
**Created:** ${issue.createdAt}
**Updated:** ${issue.updatedAt}
**URL:** ${issue.url}

## Description

${issue.body || "(No description)"}
`

  if (include_comments && issue.comments?.length > 0) {
    output += `\n## Comments (${issue.comments.length})\n\n`
    for (const comment of issue.comments) {
      output += `### @${comment.author.login} (${comment.createdAt})\n\n${comment.body}\n\n---\n\n`
    }
  }

  return {
    content: [{ type: "text", text: output }],
  }
}
