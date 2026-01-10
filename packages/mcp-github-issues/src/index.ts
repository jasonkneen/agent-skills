#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js"
import { getIssue, getIssueTool, type GetIssueArgs } from "./tools/get-issue.js"
import { listIssues, listIssuesTool, type ListIssuesArgs } from "./tools/list-issues.js"
import { getPr, getPrTool, type GetPrArgs } from "./tools/get-pr.js"
import { searchIssues, searchIssuesTool, type SearchIssuesArgs } from "./tools/search.js"

const server = new Server(
  {
    name: "mcp-github-issues",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
)

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [getIssueTool, listIssuesTool, getPrTool, searchIssuesTool],
}))

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params

  try {
    switch (name) {
      case "github_get_issue":
        return await getIssue(args as unknown as GetIssueArgs)
      case "github_list_issues":
        return await listIssues(args as unknown as ListIssuesArgs)
      case "github_get_pr":
        return await getPr(args as unknown as GetPrArgs)
      case "github_search_issues":
        return await searchIssues(args as unknown as SearchIssuesArgs)
      default:
        return {
          content: [{ type: "text", text: `Unknown tool: ${name}` }],
          isError: true,
        }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return {
      content: [{ type: "text", text: `Error: ${message}` }],
      isError: true,
    }
  }
})

async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
  console.error("GitHub Issues MCP server running on stdio")
}

main().catch(console.error)
