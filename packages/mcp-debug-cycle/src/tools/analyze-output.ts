import type { Tool, CallToolResult } from "@modelcontextprotocol/sdk/types.js"
import { readFileSync, readdirSync } from "fs"
import { homedir } from "os"
import { join } from "path"

/**
 * Standard MCP tool result format (re-export from SDK)
 */
type ToolResult = CallToolResult

export const analyzeOutputTool: Tool = {
  name: "debug_analyze_output",
  description:
    "Analyze captured debug output to identify patterns, errors, and insights. Can analyze latest capture or a specific file.",
  inputSchema: {
    type: "object",
    properties: {
      capture_file: {
        type: "string",
        description:
          "Path to capture file (default: latest in ~/.claude/debug-captures/)",
      },
      focus: {
        type: "string",
        enum: ["errors", "debug", "flow", "all"],
        description: "What to focus analysis on (default: all)",
        default: "all",
      },
      search_pattern: {
        type: "string",
        description: "Regex pattern to search for in output",
      },
    },
    required: [],
  },
}

export interface AnalyzeOutputArgs {
  capture_file?: string
  focus?: "errors" | "debug" | "flow" | "all"
  search_pattern?: string
}

/**
 * Find the latest capture file
 */
function findLatestCapture(): string | null {
  const captureDir = join(homedir(), ".claude", "debug-captures")
  try {
    const files = readdirSync(captureDir)
      .filter((f) => f.startsWith("capture-") && f.endsWith(".log"))
      .sort()
      .reverse()

    if (files.length === 0) return null
    return join(captureDir, files[0])
  } catch {
    return null
  }
}

/**
 * Extract error patterns from output
 */
function extractErrors(content: string): string[] {
  const errorPatterns = [
    /error[:\s].*/gi,
    /exception[:\s].*/gi,
    /failed[:\s].*/gi,
    /fatal[:\s].*/gi,
    /TypeError.*/gi,
    /ReferenceError.*/gi,
    /SyntaxError.*/gi,
    /cannot .*/gi,
    /undefined is not.*/gi,
    /null is not.*/gi,
  ]

  const errors: string[] = []
  const lines = content.split("\n")

  for (const line of lines) {
    for (const pattern of errorPatterns) {
      if (pattern.test(line)) {
        errors.push(line.trim())
        break
      }
    }
  }

  return [...new Set(errors)] // Deduplicate
}

/**
 * Extract debug log entries
 */
function extractDebugLogs(content: string): string[] {
  return content
    .split("\n")
    .filter((line) => line.includes("[DEBUG]"))
    .map((line) => line.trim())
}

/**
 * Analyze execution flow from debug logs
 */
function analyzeFlow(debugLogs: string[]): string {
  if (debugLogs.length === 0) {
    return "No debug logs found to analyze flow."
  }

  const flow: string[] = []
  flow.push(`Execution flow (${debugLogs.length} debug points):`)
  flow.push("")

  debugLogs.forEach((log, i) => {
    // Extract just the message part
    const match = log.match(/\[DEBUG\]\s*(.*)/)
    const message = match ? match[1] : log
    flow.push(`${i + 1}. ${message}`)
  })

  return flow.join("\n")
}

export async function analyzeOutput(args: AnalyzeOutputArgs): Promise<ToolResult> {
  const { capture_file, focus = "all", search_pattern } = args

  // Find capture file
  const filePath = capture_file || findLatestCapture()
  if (!filePath) {
    return {
      content: [
        {
          type: "text",
          text: "No capture file found. Run debug_capture_output first.",
        },
      ],
      isError: true,
    }
  }

  try {
    const content = readFileSync(filePath, "utf-8")

    const sections: string[] = []
    sections.push(`# Debug Analysis: ${filePath.split("/").pop()}`)
    sections.push("")

    // Search pattern results
    if (search_pattern) {
      const regex = new RegExp(search_pattern, "gi")
      const matches = content.match(regex)
      sections.push(`## Pattern Search: ${search_pattern}`)
      if (matches) {
        sections.push(`Found ${matches.length} matches:`)
        matches.slice(0, 20).forEach((m) => sections.push(`  - ${m}`))
        if (matches.length > 20) {
          sections.push(`  ... and ${matches.length - 20} more`)
        }
      } else {
        sections.push("No matches found.")
      }
      sections.push("")
    }

    // Error analysis
    if (focus === "errors" || focus === "all") {
      const errors = extractErrors(content)
      sections.push("## Errors Found")
      if (errors.length > 0) {
        errors.slice(0, 20).forEach((e) => sections.push(`- ${e}`))
        if (errors.length > 20) {
          sections.push(`... and ${errors.length - 20} more`)
        }
      } else {
        sections.push("No obvious errors detected.")
      }
      sections.push("")
    }

    // Debug log analysis
    if (focus === "debug" || focus === "all") {
      const debugLogs = extractDebugLogs(content)
      sections.push("## Debug Logs")
      if (debugLogs.length > 0) {
        sections.push(`Found ${debugLogs.length} debug log entries:`)
        debugLogs.slice(0, 30).forEach((l) => sections.push(`  ${l}`))
        if (debugLogs.length > 30) {
          sections.push(`  ... and ${debugLogs.length - 30} more`)
        }
      } else {
        sections.push("No [DEBUG] logs found.")
      }
      sections.push("")
    }

    // Flow analysis
    if (focus === "flow" || focus === "all") {
      const debugLogs = extractDebugLogs(content)
      sections.push("## Execution Flow")
      sections.push(analyzeFlow(debugLogs))
      sections.push("")
    }

    // Summary
    sections.push("## Summary")
    const errors = extractErrors(content)
    const debugLogs = extractDebugLogs(content)
    sections.push(`- Total lines: ${content.split("\n").length}`)
    sections.push(`- Errors detected: ${errors.length}`)
    sections.push(`- Debug log entries: ${debugLogs.length}`)

    if (errors.length > 0) {
      sections.push("\n**Recommendation:** Fix the errors listed above.")
    } else if (debugLogs.length > 0) {
      sections.push("\n**Recommendation:** Review debug log values for unexpected data.")
    } else {
      sections.push("\n**Recommendation:** Add more debug logs to trace the issue.")
    }

    return {
      content: [{ type: "text", text: sections.join("\n") }],
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return {
      content: [{ type: "text", text: `Failed to analyze: ${message}` }],
      isError: true,
    }
  }
}
