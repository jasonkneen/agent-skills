import type { Tool, CallToolResult } from "@modelcontextprotocol/sdk/types.js";
/**
 * Standard MCP tool result format (re-export from SDK)
 */
type ToolResult = CallToolResult;
export declare const captureOutputTool: Tool;
export interface CaptureOutputArgs {
    command: string;
    args?: string[];
    cwd?: string;
    timeout?: number;
    filter_debug?: boolean;
}
export declare function captureOutput(args: CaptureOutputArgs): Promise<ToolResult>;
export {};
//# sourceMappingURL=capture-output.d.ts.map