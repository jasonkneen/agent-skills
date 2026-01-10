import { readFileSync, writeFileSync } from "fs";
export const addLogsTool = {
    name: "debug_add_logs",
    description: "Add debug logging statements to a file at specified locations. Logs are marked with [DEBUG] prefix for easy removal.",
    inputSchema: {
        type: "object",
        properties: {
            file_path: {
                type: "string",
                description: "Path to the file to instrument",
            },
            locations: {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        line: {
                            type: "number",
                            description: "Line number to insert log after",
                        },
                        message: {
                            type: "string",
                            description: "Log message (variables will be interpolated)",
                        },
                        variables: {
                            type: "array",
                            items: { type: "string" },
                            description: "Variable names to log values of",
                        },
                    },
                    required: ["line", "message"],
                },
                description: "Locations to add logging",
            },
            log_style: {
                type: "string",
                enum: ["console", "print", "logger"],
                description: "Logging style based on language (default: auto-detect)",
            },
        },
        required: ["file_path", "locations"],
    },
};
/**
 * Detect language from file extension
 */
function detectLanguage(filePath) {
    const ext = filePath.split(".").pop()?.toLowerCase();
    const langMap = {
        ts: "typescript",
        tsx: "typescript",
        js: "javascript",
        jsx: "javascript",
        py: "python",
        rb: "ruby",
        java: "java",
        go: "go",
        rs: "rust",
    };
    return langMap[ext || ""] || "javascript";
}
/**
 * Generate log statement for language
 */
function generateLogStatement(lang, message, variables = [], _style) {
    const prefix = "[DEBUG]";
    const varList = variables.length > 0 ? variables.join(", ") : "";
    switch (lang) {
        case "python":
            if (variables.length > 0) {
                const varStr = variables.map((v) => `${v}={${v}}`).join(", ");
                return `print(f"${prefix} ${message}: ${varStr}")  # AUTO-DEBUG`;
            }
            return `print("${prefix} ${message}")  # AUTO-DEBUG`;
        case "ruby":
            if (variables.length > 0) {
                const varStr = variables.map((v) => `#{${v}}`).join(", ");
                return `puts "${prefix} ${message}: ${varStr}"  # AUTO-DEBUG`;
            }
            return `puts "${prefix} ${message}"  # AUTO-DEBUG`;
        case "go":
            if (variables.length > 0) {
                return `fmt.Printf("${prefix} ${message}: %+v\\n", ${varList}) // AUTO-DEBUG`;
            }
            return `fmt.Println("${prefix} ${message}") // AUTO-DEBUG`;
        case "java":
            if (variables.length > 0) {
                return `System.out.println("${prefix} ${message}: " + ${variables.join(' + ", " + ')}); // AUTO-DEBUG`;
            }
            return `System.out.println("${prefix} ${message}"); // AUTO-DEBUG`;
        case "typescript":
        case "javascript":
        default:
            if (variables.length > 0) {
                return `console.log("[DEBUG] ${message}:", ${varList}); // AUTO-DEBUG`;
            }
            return `console.log("[DEBUG] ${message}"); // AUTO-DEBUG`;
    }
}
export async function addLogs(args) {
    const { file_path, locations, log_style } = args;
    try {
        const content = readFileSync(file_path, "utf-8");
        const lines = content.split("\n");
        const lang = detectLanguage(file_path);
        // Sort locations by line number descending to insert from bottom up
        const sortedLocations = [...locations].sort((a, b) => b.line - a.line);
        for (const loc of sortedLocations) {
            const logStmt = generateLogStatement(lang, loc.message, loc.variables, log_style);
            // Get indentation from the target line
            const targetLine = lines[loc.line - 1] || "";
            const indent = targetLine.match(/^(\s*)/)?.[1] || "";
            // Insert log after the specified line
            lines.splice(loc.line, 0, indent + logStmt);
        }
        writeFileSync(file_path, lines.join("\n"));
        return {
            content: [
                {
                    type: "text",
                    text: `Added ${locations.length} debug log(s) to ${file_path}\n\nLocations:\n${locations
                        .map((l) => `  Line ${l.line}: ${l.message}`)
                        .join("\n")}\n\nUse debug_remove_logs to clean up when done.`,
                },
            ],
        };
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return {
            content: [{ type: "text", text: `Failed to add logs: ${message}` }],
            isError: true,
        };
    }
}
//# sourceMappingURL=add-logs.js.map