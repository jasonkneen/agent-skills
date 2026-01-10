import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { ToolResult } from "../utils/gh-cli.js";
export declare const searchIssuesTool: Tool;
export interface SearchIssuesArgs {
    owner: string;
    repo: string;
    query: string;
    type?: "issue" | "pr" | "all";
    state?: "open" | "closed" | "all";
    sort?: "created" | "updated" | "comments" | "reactions";
    limit?: number;
}
export declare function searchIssues(args: SearchIssuesArgs): Promise<ToolResult>;
//# sourceMappingURL=search.d.ts.map