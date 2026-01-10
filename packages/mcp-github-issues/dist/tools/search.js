import { gh, formatRepo } from "../utils/gh-cli.js";
export const searchIssuesTool = {
    name: "github_search_issues",
    description: "Search GitHub issues and PRs using full-text search with optional filters",
    inputSchema: {
        type: "object",
        properties: {
            owner: {
                type: "string",
                description: "Repository owner (e.g., 'anthropics')",
            },
            repo: {
                type: "string",
                description: "Repository name (e.g., 'claude-code')",
            },
            query: {
                type: "string",
                description: "Search query (searches title, body, and comments)",
            },
            type: {
                type: "string",
                enum: ["issue", "pr", "all"],
                description: "Filter by type (default: all)",
                default: "all",
            },
            state: {
                type: "string",
                enum: ["open", "closed", "all"],
                description: "Filter by state (default: all)",
                default: "all",
            },
            sort: {
                type: "string",
                enum: ["created", "updated", "comments", "reactions"],
                description: "Sort results by (default: updated)",
                default: "updated",
            },
            limit: {
                type: "number",
                description: "Maximum results to return (default: 30, max: 100)",
                default: 30,
            },
        },
        required: ["owner", "repo", "query"],
    },
};
export async function searchIssues(args) {
    const { owner, repo, query, type = "all", state = "all", sort = "updated", limit = 30, } = args;
    // Build GitHub search query
    let searchQuery = `repo:${formatRepo(owner, repo)} ${query}`;
    if (type === "issue") {
        searchQuery += " is:issue";
    }
    else if (type === "pr") {
        searchQuery += " is:pr";
    }
    if (state !== "all") {
        searchQuery += ` is:${state}`;
    }
    const ghArgs = [
        "search",
        "issues",
        searchQuery,
        "--sort",
        sort,
        "--limit",
        String(Math.min(limit, 100)),
        "--json",
        "number,title,state,type,author,labels,createdAt,updatedAt,url",
    ];
    const result = await gh(ghArgs);
    if (!result.success || !result.data) {
        return {
            content: [{
                    type: "text",
                    text: `Failed to search issues: ${result.error || "No data returned"}`
                }],
            isError: true,
        };
    }
    const items = result.data;
    if (items.length === 0) {
        return {
            content: [
                {
                    type: "text",
                    text: `No results found for "${query}" in ${owner}/${repo}`,
                },
            ],
        };
    }
    let output = `# Search Results: "${query}" (${items.length} results)\n\n`;
    output += `| # | Type | Title | State | Labels | Author | Updated |\n`;
    output += `|---|------|-------|-------|--------|--------|----------|\n`;
    for (const item of items) {
        const labelsList = item.labels.map((l) => l.name).join(", ") || "-";
        const updated = new Date(item.updatedAt).toLocaleDateString();
        const typeEmoji = item.type === "PullRequest" ? "🔀" : "🐛";
        output += `| #${item.number} | ${typeEmoji} | ${item.title.slice(0, 40)}${item.title.length > 40 ? "..." : ""} | ${item.state} | ${labelsList} | @${item.author.login} | ${updated} |\n`;
    }
    return {
        content: [{ type: "text", text: output }],
    };
}
//# sourceMappingURL=search.js.map