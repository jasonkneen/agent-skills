#!/usr/bin/env node
/**
 * TDD Enforcement Hook
 *
 * When TDD mode is active, blocks edits to non-test files.
 * Forces "red-green-refactor" discipline.
 *
 * Control via:
 * - Create ~/.claude/tdd-mode to enable
 * - Delete ~/.claude/tdd-mode to disable
 * - Or use /tdd skill to toggle
 */

import { readFileSync, existsSync } from 'fs'
import { homedir } from 'os'
import { join, basename } from 'path'

// Configuration
const TDD_MODE_FILE = join(homedir(), '.claude', 'tdd-mode')

// Test file patterns
const TEST_PATTERNS = [
  /\.test\.[jt]sx?$/,
  /\.spec\.[jt]sx?$/,
  /_test\.[jt]sx?$/,
  /_spec\.[jt]sx?$/,
  /\.test\.py$/,
  /_test\.py$/,
  /test_.*\.py$/,
  /\.spec\.rb$/,
  /_spec\.rb$/,
  /Test\.java$/,
  /Tests?\.cs$/,
  /__tests__\//,
  /\/tests?\//,
  /\/spec\//,
]

// Files always allowed (config, etc)
const ALWAYS_ALLOWED = [
  /package\.json$/,
  /tsconfig\.json$/,
  /\.eslintrc/,
  /\.prettierrc/,
  /jest\.config/,
  /vitest\.config/,
  /\.env/,
]

/**
 * Read hook input from stdin
 */
function readInput() {
  try {
    const input = readFileSync(0, 'utf-8')
    return JSON.parse(input)
  } catch {
    return null
  }
}

/**
 * Check if TDD mode is active
 */
function isTddModeActive() {
  return existsSync(TDD_MODE_FILE)
}

/**
 * Check if file is a test file
 */
function isTestFile(filePath) {
  if (!filePath) return false
  return TEST_PATTERNS.some(pattern => pattern.test(filePath))
}

/**
 * Check if file is always allowed
 */
function isAlwaysAllowed(filePath) {
  if (!filePath) return true
  return ALWAYS_ALLOWED.some(pattern => pattern.test(filePath))
}

/**
 * Get file path from tool arguments
 */
function getFilePath(input) {
  const args = input.tool_input || input.arguments || {}
  return args.file_path || args.filePath || args.path || null
}

/**
 * Main hook logic
 */
function main() {
  const input = readInput()
  if (!input) {
    process.exit(0) // No input, allow
  }

  // Only check in TDD mode
  if (!isTddModeActive()) {
    process.exit(0) // TDD mode not active, allow all
  }

  // Only check file-modifying tools
  const tool = input.tool_name || input.toolName || ''
  const modifyingTools = ['Write', 'Edit', 'MultiEdit']

  if (!modifyingTools.includes(tool)) {
    process.exit(0) // Not a file edit, allow
  }

  const filePath = getFilePath(input)

  if (!filePath) {
    process.exit(0) // No file path, allow (shouldn't happen)
  }

  // Allow test files and config files
  if (isTestFile(filePath) || isAlwaysAllowed(filePath)) {
    process.exit(0) // Test or config file, allow
  }

  // Block non-test file edits
  const fileName = basename(filePath)
  console.error(`🛑 TDD Mode: Blocked edit to "${fileName}"`)
  console.error(`   Only test files can be edited in TDD mode.`)
  console.error(`   To disable: rm ~/.claude/tdd-mode`)
  console.error(`   Or finish writing tests first!`)

  // Exit code 2 = block the tool
  process.exit(2)
}

main()
