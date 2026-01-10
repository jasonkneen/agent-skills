import { execFile } from "child_process";
import { promisify } from "util";
import { writeFileSync, mkdirSync, existsSync } from "fs";
import { homedir } from "os";
import { join } from "path";
const execFileAsync = promisify(execFile);
export const captureOutputTool = {
    name: "debug_capture_output",
    description: "Run a command and capture its output (stdout, stderr) for analysis. Saves output to ~/.claude/debug-captures/",
    inputSchema: {
        type: "object",
        properties: {
            command: {
                type: "string",
                description: "Command to run (e.g., 'npm test')",
            },
            args: {
                type: "array",
                items: { type: "string" },
                description: "Command arguments",
            },
            cwd: {
                type: "string",
                description: "Working directory (default: current)",
            },
            timeout: {
                type: "number",
                description: "Timeout in milliseconds (default: 60000)",
                default: 60000,
            },
            filter_debug: {
                type: "boolean",
                description: "Only show lines containing [DEBUG] (default: false)",
                default: false,
            },
        },
        required: ["command"],
    },
};
export async function captureOutput(args) {
    const { command, args: cmdArgs = [], cwd, timeout = 60000, filter_debug = false, } = args;
    const captureDir = join(homedir(), ".claude", "debug-captures");
    if (!existsSync(captureDir)) {
        mkdirSync(captureDir, { recursive: true });
    }
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const captureFile = join(captureDir, `capture-${timestamp}.log`);
    try {
        const { stdout, stderr } = await execFileAsync(command, cmdArgs, {
            cwd,
            timeout,
            maxBuffer: 10 * 1024 * 1024, // 10MB
        });
        let output = "";
        if (stdout)
            output += `=== STDOUT ===\n${stdout}\n`;
        if (stderr)
            output += `=== STDERR ===\n${stderr}\n`;
        // Save full output
        writeFileSync(captureFile, output);
        // Filter for debug lines if requested
        let displayOutput = output;
        if (filter_debug) {
            const debugLines = output
                .split("\n")
                .filter((line) => line.includes("[DEBUG]"));
            displayOutput =
                debugLines.length > 0
                    ? debugLines.join("\n")
                    : "(No [DEBUG] lines found in output)";
        }
        // Truncate if too long
        const maxDisplay = 10000;
        if (displayOutput.length > maxDisplay) {
            displayOutput =
                displayOutput.slice(0, maxDisplay) +
                    `\n\n... (truncated, full output in ${captureFile})`;
        }
        return {
            content: [
                {
                    type: "text",
                    text: `Command: ${command} ${cmdArgs.join(" ")}\nExit: success\nSaved to: ${captureFile}\n\n${displayOutput}`,
                },
            ],
        };
    }
    catch (error) {
        // Command failed - still capture output
        const execError = error;
        let output = `=== COMMAND FAILED ===\n`;
        output += `Exit code: ${execError.code || "unknown"}\n`;
        if (execError.stdout)
            output += `\n=== STDOUT ===\n${execError.stdout}\n`;
        if (execError.stderr)
            output += `\n=== STDERR ===\n${execError.stderr}\n`;
        writeFileSync(captureFile, output);
        let displayOutput = output;
        if (filter_debug) {
            const debugLines = output
                .split("\n")
                .filter((line) => line.includes("[DEBUG]"));
            if (debugLines.length > 0) {
                displayOutput = `Exit code: ${execError.code}\n\n[DEBUG] lines:\n${debugLines.join("\n")}`;
            }
        }
        return {
            content: [
                {
                    type: "text",
                    text: `Command: ${command} ${cmdArgs.join(" ")}\nExit: failed\nSaved to: ${captureFile}\n\n${displayOutput}`,
                },
            ],
        };
    }
}
//# sourceMappingURL=capture-output.js.map