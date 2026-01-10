import type { Tool, CallToolResult } from "@modelcontextprotocol/sdk/types.js";
/**
 * Standard MCP tool result format (re-export from SDK)
 */
type ToolResult = CallToolResult;
export declare const analyzeOutputTool: Tool;
export interface AnalyzeOutputArgs {
    capture_file?: string;
    focus?: "errors" | "debug" | "flow" | "all";
    search_pattern?: string;
}
export declare function analyzeOutput(args: AnalyzeOutputArgs): Promise<ToolResult>;
export {};
//# sourceMappingURL=analyze-output.d.ts.map