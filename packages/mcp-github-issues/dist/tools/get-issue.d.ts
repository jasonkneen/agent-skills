import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { ToolResult } from "../utils/gh-cli.js";
export declare const getIssueTool: Tool;
export interface GetIssueArgs {
    owner: string;
    repo: string;
    issue_number: number;
    include_comments?: boolean;
}
export declare function getIssue(args: GetIssueArgs): Promise<ToolResult>;
//# sourceMappingURL=get-issue.d.ts.map