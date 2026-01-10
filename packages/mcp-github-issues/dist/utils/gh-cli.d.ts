import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
export interface GhResult<T> {
    success: boolean;
    data?: T;
    error?: string;
}
/**
 * Standard MCP tool result format (re-export from SDK)
 */
export type ToolResult = CallToolResult;
/**
 * Safe wrapper for gh CLI - uses execFile to prevent shell injection
 * and validates arguments to prevent unauthorized operations
 */
export declare function gh<T>(args: string[]): Promise<GhResult<T>>;
/**
 * Parse repo string "owner/repo" into parts
 */
export declare function parseRepo(repo: string): {
    owner: string;
    repo: string;
} | null;
/**
 * Format repo for gh CLI -R flag
 */
export declare function formatRepo(owner: string, repo: string): string;
//# sourceMappingURL=gh-cli.d.ts.map