import type { Tool, CallToolResult } from "@modelcontextprotocol/sdk/types.js";
/**
 * Standard MCP tool result format (re-export from SDK)
 */
type ToolResult = CallToolResult;
export declare const addLogsTool: Tool;
export interface LogLocation {
    line: number;
    message: string;
    variables?: string[];
}
export interface AddLogsArgs {
    file_path: string;
    locations: LogLocation[];
    log_style?: "console" | "print" | "logger";
}
export declare function addLogs(args: AddLogsArgs): Promise<ToolResult>;
export {};
//# sourceMappingURL=add-logs.d.ts.map