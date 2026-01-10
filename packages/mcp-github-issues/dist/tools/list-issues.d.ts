import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { ToolResult } from "../utils/gh-cli.js";
export declare const listIssuesTool: Tool;
export interface ListIssuesArgs {
    owner: string;
    repo: string;
    state?: "open" | "closed" | "all";
    labels?: string[];
    assignee?: string;
    author?: string;
    limit?: number;
}
export declare function listIssues(args: ListIssuesArgs): Promise<ToolResult>;
//# sourceMappingURL=list-issues.d.ts.map