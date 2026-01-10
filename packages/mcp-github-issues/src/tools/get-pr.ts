import { Tool } from "@modelcontextprotocol/sdk/types.js"
import { gh, formatRepo, ToolResult } from "../utils/gh-cli.js"

export const getPrTool: Tool = {
  name: "github_get_pr",
  description:
    "Fetch a GitHub pull request by number, including title, body, files changed, and review comments",
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
      pr_number: {
        type: "number",
        description: "Pull request number to fetch",
      },
      include_diff: {
        type: "boolean",
        description: "Include diff summary (default: false - can be large)",
        default: false,
      },
      include_comments: {
        type: "boolean",
        description: "Include review comments (default: true)",
        default: true,
      },
    },
    required: ["owner", "repo", "pr_number"],
  },
}

interface GitHubPr {
  number: number
  title: string
  body: string
  state: string
  author: { login: string }
  baseRefName: string
  headRefName: string
  mergeable: string
  additions: number
  deletions: number
  changedFiles: number
  createdAt: string
  updatedAt: string
  url: string
  files: Array<{
    path: string
    additions: number
    deletions: number
  }>
  reviews: Array<{
    author: { login: string }
    body: string
    state: string
    submittedAt: string
  }>
  comments: Array<{
    author: { login: string }
    body: string
    createdAt: string
  }>
}

export interface GetPrArgs {
  owner: string
  repo: string
  pr_number: number
  include_diff?: boolean
  include_comments?: boolean
}

export async function getPr(args: GetPrArgs): Promise<ToolResult> {
  const { owner, repo, pr_number, include_diff = false, include_comments = true } = args

  const fields = [
    "number",
    "title",
    "body",
    "state",
    "author",
    "baseRefName",
    "headRefName",
    "mergeable",
    "additions",
    "deletions",
    "changedFiles",
    "createdAt",
    "updatedAt",
    "url",
    "files",
  ]

  if (include_comments) {
    fields.push("reviews", "comments")
  }

  const result = await gh<GitHubPr>([
    "pr",
    "view",
    String(pr_number),
    "-R",
    formatRepo(owner, repo),
    "--json",
    fields.join(","),
  ])

  if (!result.success || !result.data) {
    return {
      content: [{
        type: "text",
        text: `Failed to fetch PR: ${result.error || "No data returned"}`
      }],
      isError: true,
    }
  }

  const pr = result.data

  let output = `# PR #${pr.number}: ${pr.title}

**State:** ${pr.state}
**Author:** @${pr.author.login}
**Branch:** ${pr.headRefName} → ${pr.baseRefName}
**Mergeable:** ${pr.mergeable}
**Changes:** +${pr.additions} -${pr.deletions} (${pr.changedFiles} files)
**Created:** ${pr.createdAt}
**Updated:** ${pr.updatedAt}
**URL:** ${pr.url}

## Description

${pr.body || "(No description)"}

## Files Changed (${pr.files.length})

`

  for (const file of pr.files.slice(0, 50)) {
    output += `- \`${file.path}\` (+${file.additions} -${file.deletions})\n`
  }

  if (pr.files.length > 50) {
    output += `\n... and ${pr.files.length - 50} more files\n`
  }

  if (include_comments) {
    if (pr.reviews?.length > 0) {
      output += `\n## Reviews (${pr.reviews.length})\n\n`
      for (const review of pr.reviews) {
        output += `### @${review.author.login} - ${review.state} (${review.submittedAt})\n\n${review.body || "(No comment)"}\n\n---\n\n`
      }
    }

    if (pr.comments?.length > 0) {
      output += `\n## Comments (${pr.comments.length})\n\n`
      for (const comment of pr.comments) {
        output += `### @${comment.author.login} (${comment.createdAt})\n\n${comment.body}\n\n---\n\n`
      }
    }
  }

  // Optionally get the diff
  if (include_diff) {
    const diffResult = await gh<string>([
      "pr",
      "diff",
      String(pr_number),
      "-R",
      formatRepo(owner, repo),
    ])

    if (diffResult.success && diffResult.data) {
      const diff = String(diffResult.data)
      // Truncate if too large
      const maxDiffLength = 50000
      const truncatedDiff =
        diff.length > maxDiffLength
          ? diff.slice(0, maxDiffLength) + "\n\n... (diff truncated)"
          : diff

      output += `\n## Diff\n\n\`\`\`diff\n${truncatedDiff}\n\`\`\`\n`
    }
  }

  return {
    content: [{ type: "text", text: output }],
  }
}
