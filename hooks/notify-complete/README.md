# Notification Hook

Sends OS notification when Claude Code completes a task. Perfect for long-running operations.

## Features

- 🔔 Cross-platform notifications (macOS, Linux, Windows)
- 🎵 Sound alert on macOS
- 📝 Shows completion reason when available

## Installation

### Option 1: Add to project hooks

Add to your project's `.claude/hooks.json`:

```json
{
  "hooks": [
    {
      "matcher": "Stop",
      "hooks": [
        {
          "type": "command",
          "command": "node /path/to/notify.js"
        }
      ]
    }
  ]
}
```

### Option 2: Add to global hooks

Add to `~/.claude/hooks.json` for all projects.

## Platform Requirements

### macOS
- Built-in `osascript` (no installation needed)

### Linux
- `notify-send` (install: `sudo apt install libnotify-bin`)
- Or `zenity` as fallback

### Windows
- PowerShell (built-in)

## Customization

Edit `notify.js` to customize:

- Notification sound (macOS: change `sound name "Glass"`)
- Message format
- Add more context from hook input

## Example Notifications

**macOS:**
```
🔔 Claude Code
   Task completed
```

**With reason:**
```
🔔 Claude Code
   Stopped: User requested
```
