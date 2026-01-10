#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema, } from "@modelcontextprotocol/sdk/types.js";
import { addLogs, addLogsTool } from "./tools/add-logs.js";
import { removeLogs, removeLogsTool } from "./tools/remove-logs.js";
import { captureOutput, captureOutputTool } from "./tools/capture-output.js";
import { analyzeOutput, analyzeOutputTool } from "./tools/analyze-output.js";
const server = new Server({
    name: "mcp-debug-cycle",
    version: "0.1.0",
}, {
    capabilities: {
        tools: {},
    },
});
// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [addLogsTool, removeLogsTool, captureOutputTool, analyzeOutputTool],
}));
// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    try {
        switch (name) {
            case "debug_add_logs":
                return await addLogs(args);
            case "debug_remove_logs":
                return await removeLogs(args);
            case "debug_capture_output":
                return await captureOutput(args);
            case "debug_analyze_output":
                return await analyzeOutput(args);
            default:
                return {
                    content: [{ type: "text", text: `Unknown tool: ${name}` }],
                    isError: true,
                };
        }
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return {
            content: [{ type: "text", text: `Error: ${message}` }],
            isError: true,
        };
    }
});
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Debug Cycle MCP server running on stdio");
}
main().catch(console.error);
//# sourceMappingURL=index.js.map