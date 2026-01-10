import type { Tool, CallToolResult } from "@modelcontextprotocol/sdk/types.js";
/**
 * Standard MCP tool result format (re-export from SDK)
 */
type ToolResult = CallToolResult;
export declare const removeLogsTool: Tool;
export interface RemoveLogsArgs {
    file_path: string;
    dry_run?: boolean;
}
export declare function removeLogs(args: RemoveLogsArgs): Promise<ToolResult>;
export {};
//# sourceMappingURL=remove-logs.d.ts.map