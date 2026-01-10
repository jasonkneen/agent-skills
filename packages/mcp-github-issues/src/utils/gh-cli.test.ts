import { describe, it, expect, vi, beforeEach } from "vitest"
import { gh, parseRepo, formatRepo } from "./gh-cli.js"
import * as childProcess from "child_process"
import type { ChildProcess } from "child_process"

// Mock child_process
vi.mock("child_process")

describe("gh-cli", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("gh()", () => {
    it("should reject invalid subcommands", async () => {
      const result = await gh(["invalid-command", "arg"])

      expect(result.success).toBe(false)
      expect(result.error).toContain("Invalid gh subcommand")
      expect(result.error).toContain("invalid-command")
    })

    it("should reject dangerous flags", async () => {
      const result = await gh(["issue", "view", "123", "--web"])

      expect(result.success).toBe(false)
      expect(result.error).toContain("unauthorized flags")
    })

    it("should allow valid issue commands", async () => {
      const spy = vi.spyOn(childProcess, "execFile")
      spy.mockImplementation(((_file: any, _args: any, _opts: any, callback: any) => {
        if (callback) {
          callback(null, { stdout: '{"number": 123}', stderr: '' } as any, null)
        }
        return {} as ChildProcess
      }) as any)

      const result = await gh(["issue", "view", "123", "--json", "number,title"])

      expect(result.success).toBe(true)
      expect(result.data).toEqual({ number: 123 })
    })

    it("should handle JSON parse errors gracefully", async () => {
      const spy = vi.spyOn(childProcess, "execFile")
      spy.mockImplementation(((_file: any, _args: any, _opts: any, callback: any) => {
        if (callback) {
          callback(null, { stdout: 'not json', stderr: '' } as any, null)
        }
        return {} as ChildProcess
      }) as any)

      const result = await gh(["issue", "view", "123"])

      expect(result.success).toBe(true)
      expect(result.data).toBe("not json")
    })

    it("should handle execution errors", async () => {
      const spy = vi.spyOn(childProcess, "execFile")
      spy.mockImplementation(((_file: any, _args: any, _opts: any, callback: any) => {
        if (callback) {
          callback(new Error("gh not found"), null, null)
        }
        return {} as ChildProcess
      }) as any)

      const result = await gh(["issue", "view", "123"])

      expect(result.success).toBe(false)
      expect(result.error).toContain("gh not found")
    })

    it("should handle stderr without stdout", async () => {
      const spy = vi.spyOn(childProcess, "execFile")
      spy.mockImplementation(((_file: any, _args: any, _opts: any, callback: any) => {
        if (callback) {
          callback(null, { stdout: '', stderr: 'Issue not found' } as any, null)
        }
        return {} as ChildProcess
      }) as any)

      const result = await gh(["issue", "view", "999"])

      expect(result.success).toBe(false)
      expect(result.error).toBe("Issue not found")
    })

    it("should block --web flag", async () => {
      const result = await gh(["issue", "view", "123", "--web"])

      expect(result.success).toBe(false)
      expect(result.error).toContain("unauthorized flags")
    })

    it("should block --browser flag", async () => {
      const result = await gh(["pr", "list", "--browser"])

      expect(result.success).toBe(false)
      expect(result.error).toContain("unauthorized flags")
    })
  })

  describe("parseRepo()", () => {
    it("should parse valid repo string", () => {
      const result = parseRepo("anthropics/claude-code")

      expect(result).toEqual({ owner: "anthropics", repo: "claude-code" })
    })

    it("should return null for invalid format", () => {
      expect(parseRepo("invalid")).toBeNull()
      expect(parseRepo("too/many/slashes")).toBeNull()
      expect(parseRepo("")).toBeNull()
    })
  })

  describe("formatRepo()", () => {
    it("should format owner and repo", () => {
      const result = formatRepo("anthropics", "claude-code")

      expect(result).toBe("anthropics/claude-code")
    })

    it("should handle special characters", () => {
      const result = formatRepo("org-name", "repo.name")

      expect(result).toBe("org-name/repo.name")
    })
  })
})
