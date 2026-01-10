import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { ToolResult } from "../utils/gh-cli.js";
export declare const getPrTool: Tool;
export interface GetPrArgs {
    owner: string;
    repo: string;
    pr_number: number;
    include_diff?: boolean;
    include_comments?: boolean;
}
export declare function getPr(args: GetPrArgs): Promise<ToolResult>;
//# sourceMappingURL=get-pr.d.ts.map