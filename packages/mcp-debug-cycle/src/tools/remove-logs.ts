import type { Tool, CallToolResult } from "@modelcontextprotocol/sdk/types.js"
import { readFileSync, writeFileSync } from "fs"

/**
 * Standard MCP tool result format (re-export from SDK)
 */
type ToolResult = CallToolResult

export const removeLogsTool: Tool = {
  name: "debug_remove_logs",
  description:
    "Remove all debug logging statements (marked with AUTO-DEBUG comment) from a file",
  inputSchema: {
    type: "object",
    properties: {
      file_path: {
        type: "string",
        description: "Path to the file to clean up",
      },
      dry_run: {
        type: "boolean",
        description: "If true, show what would be removed without making changes",
        default: false,
      },
    },
    required: ["file_path"],
  },
}

export interface RemoveLogsArgs {
  file_path: string
  dry_run?: boolean
}

export async function removeLogs(args: RemoveLogsArgs): Promise<ToolResult> {
  const { file_path, dry_run = false } = args

  try {
    const content = readFileSync(file_path, "utf-8")
    const lines = content.split("\n")

    const debugMarker = "AUTO-DEBUG"
    const removedLines: { line: number; content: string }[] = []
    const cleanedLines: string[] = []

    lines.forEach((line, index) => {
      if (line.includes(debugMarker)) {
        removedLines.push({ line: index + 1, content: line.trim() })
      } else {
        cleanedLines.push(line)
      }
    })

    if (removedLines.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: `No debug logs found in ${file_path}`,
          },
        ],
      }
    }

    if (dry_run) {
      return {
        content: [
          {
            type: "text",
            text: `Would remove ${removedLines.length} debug log(s) from ${file_path}:\n\n${removedLines
              .map((r) => `  Line ${r.line}: ${r.content}`)
              .join("\n")}`,
          },
        ],
      }
    }

    writeFileSync(file_path, cleanedLines.join("\n"))

    return {
      content: [
        {
          type: "text",
          text: `Removed ${removedLines.length} debug log(s) from ${file_path}:\n\n${removedLines
            .map((r) => `  Line ${r.line}: ${r.content}`)
            .join("\n")}`,
        },
      ],
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return {
      content: [{ type: "text", text: `Failed to remove logs: ${message}` }],
      isError: true,
    }
  }
}
