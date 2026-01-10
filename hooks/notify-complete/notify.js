#!/usr/bin/env node
/**
 * Notification Hook
 *
 * Sends OS notification when Claude Code completes a task.
 * Uses node-notifier for secure cross-platform notifications.
 *
 * SECURITY: Migrated from platform-specific implementations to node-notifier
 * to prevent command injection vulnerabilities in macOS (AppleScript) and
 * Windows (PowerShell) notification systems.
 */

import notifier from 'node-notifier'
import { readFileSync } from 'fs'

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
 * Send cross-platform notification using node-notifier
 * This library handles all escaping and platform differences securely
 */
function notify(title, message) {
  notifier.notify(
    {
      title: title,
      message: message,
      sound: true,
      wait: false,
    },
    (err) => {
      if (err) {
        console.error('Notification failed:', err.message)
      }
    }
  )
}

/**
 * Main hook logic
 */
function main() {
  const input = readInput()

  // Get task summary if available
  let summary = 'Task completed'
  if (input) {
    if (input.stop_reason) {
      summary = `Stopped: ${input.stop_reason}`
    } else if (input.session_id) {
      summary = `Session ${input.session_id.slice(0, 8)} completed`
    }
  }

  notify('Claude Code', summary)

  // Exit immediately - notification is async but we don't need to wait
  process.exit(0)
}

main()
