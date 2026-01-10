#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js"
import { addLogs, addLogsTool, type AddLogsArgs } from "./tools/add-logs.js"
import { removeLogs, removeLogsTool, type RemoveLogsArgs } from "./tools/remove-logs.js"
import { captureOutput, captureOutputTool, type CaptureOutputArgs } from "./tools/capture-output.js"
import { analyzeOutput, analyzeOutputTool, type AnalyzeOutputArgs } from "./tools/analyze-output.js"

const server = new Server(
  {
    name: "mcp-debug-cycle",
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
  tools: [addLogsTool, removeLogsTool, captureOutputTool, analyzeOutputTool],
}))

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params

  try {
    switch (name) {
      case "debug_add_logs":
        return await addLogs(args as unknown as AddLogsArgs)
      case "debug_remove_logs":
        return await removeLogs(args as unknown as RemoveLogsArgs)
      case "debug_capture_output":
        return await captureOutput(args as unknown as CaptureOutputArgs)
      case "debug_analyze_output":
        return await analyzeOutput(args as unknown as AnalyzeOutputArgs)
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
  console.error("Debug Cycle MCP server running on stdio")
}

main().catch(console.error)
