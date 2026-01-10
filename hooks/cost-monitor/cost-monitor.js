#!/usr/bin/env node
/**
 * Cost Monitor Hook
 *
 * Tracks token usage per tool call and warns when approaching limits.
 * Logs to ~/.claude/usage.json for analysis.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { homedir } from 'os'
import { join, dirname } from 'path'

// Configuration
const USAGE_FILE = join(homedir(), '.claude', 'usage.json')
const WARN_THRESHOLD = 0.8 // Warn at 80% of limit
const DAILY_TOKEN_LIMIT = 100000 // Adjust based on your plan

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
 * Load existing usage data
 */
function loadUsage() {
  try {
    if (existsSync(USAGE_FILE)) {
      return JSON.parse(readFileSync(USAGE_FILE, 'utf-8'))
    }
  } catch {
    // Corrupted file, start fresh
  }
  return {
    daily: {},
    sessions: {},
    lastReset: new Date().toISOString().split('T')[0]
  }
}

/**
 * Save usage data
 */
function saveUsage(usage) {
  const dir = dirname(USAGE_FILE)
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }
  writeFileSync(USAGE_FILE, JSON.stringify(usage, null, 2))
}

/**
 * Get today's date key
 */
function getTodayKey() {
  return new Date().toISOString().split('T')[0]
}

/**
 * Estimate tokens from tool output (rough heuristic)
 */
function estimateTokens(text) {
  if (!text) return 0
  // Rough estimate: ~4 chars per token
  return Math.ceil(String(text).length / 4)
}

/**
 * Main hook logic
 */
function main() {
  const input = readInput()
  if (!input) {
    // No input, nothing to do
    process.exit(0)
  }

  const usage = loadUsage()
  const today = getTodayKey()

  // Reset daily counter if new day
  if (usage.lastReset !== today) {
    usage.daily = {}
    usage.lastReset = today
  }

  // Initialize today's usage
  if (!usage.daily[today]) {
    usage.daily[today] = {
      totalTokens: 0,
      toolCalls: 0,
      byTool: {}
    }
  }

  const dailyUsage = usage.daily[today]

  // Extract tool info from hook input
  const toolName = input.tool_name || input.toolName || 'unknown'
  const toolOutput = input.tool_output || input.output || ''

  // Estimate tokens used
  const tokensUsed = estimateTokens(toolOutput)

  // Update counters
  dailyUsage.totalTokens += tokensUsed
  dailyUsage.toolCalls += 1

  if (!dailyUsage.byTool[toolName]) {
    dailyUsage.byTool[toolName] = { calls: 0, tokens: 0 }
  }
  dailyUsage.byTool[toolName].calls += 1
  dailyUsage.byTool[toolName].tokens += tokensUsed

  // Save updated usage
  saveUsage(usage)

  // Check if approaching limit
  const usagePercent = dailyUsage.totalTokens / DAILY_TOKEN_LIMIT

  if (usagePercent >= WARN_THRESHOLD) {
    const percentUsed = Math.round(usagePercent * 100)
    console.error(`⚠️  Token usage: ${percentUsed}% of daily limit (${dailyUsage.totalTokens.toLocaleString()} / ${DAILY_TOKEN_LIMIT.toLocaleString()})`)
  }

  // Output success (hook continues)
  process.exit(0)
}

main()
