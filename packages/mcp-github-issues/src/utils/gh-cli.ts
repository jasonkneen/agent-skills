import { execFile } from "child_process"
import { promisify } from "util"
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js"

const execFileAsync = promisify(execFile)

export interface GhResult<T> {
  success: boolean
  data?: T
  error?: string
}

/**
 * Standard MCP tool result format (re-export from SDK)
 */
export type ToolResult = CallToolResult

/**
 * Allowed gh subcommands for this MCP server
 */
const ALLOWED_SUBCOMMANDS = ["issue", "pr", "search"] as const

/**
 * Dangerous flags that could enable unauthorized access or unintended behavior
 * Note: -R and --repo are used legitimately by tools, only block browser/web flags
 */
const DANGEROUS_FLAGS = ["--web", "--browser"]

/**
 * Safe wrapper for gh CLI - uses execFile to prevent shell injection
 * and validates arguments to prevent unauthorized operations
 */
export async function gh<T>(args: string[]): Promise<GhResult<T>> {
  // Validate subcommand
  if (!args[0] || !ALLOWED_SUBCOMMANDS.includes(args[0] as any)) {
    return {
      success: false,
      error: `Invalid gh subcommand: ${args[0]}. Allowed: ${ALLOWED_SUBCOMMANDS.join(", ")}`,
    }
  }

  // Check for dangerous flags that could access unauthorized repos
  const hasDangerousFlag = args.some((arg) =>
    DANGEROUS_FLAGS.some((flag) => arg.startsWith(flag))
  )

  if (hasDangerousFlag) {
    return {
      success: false,
      error: "Request contains unauthorized flags. Repository access is restricted.",
    }
  }

  try {
    const { stdout, stderr } = await execFileAsync("gh", args, {
      maxBuffer: 10 * 1024 * 1024, // 10MB for large responses
    })

    if (stderr && !stdout) {
      return { success: false, error: stderr }
    }

    try {
      const data = JSON.parse(stdout) as T
      return { success: true, data }
    } catch {
      // Not JSON, return as string
      return { success: true, data: stdout as unknown as T }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return { success: false, error: message }
  }
}

/**
 * Parse repo string "owner/repo" into parts
 */
export function parseRepo(
  repo: string
): { owner: string; repo: string } | null {
  const parts = repo.split("/")
  if (parts.length !== 2) return null
  return { owner: parts[0], repo: parts[1] }
}

/**
 * Format repo for gh CLI -R flag
 */
export function formatRepo(owner: string, repo: string): string {
  return `${owner}/${repo}`
}
