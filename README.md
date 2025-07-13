# Config Tool 🔐

Your friendly VS Code companion for encrypting and decrypting configuration values! Works seamlessly with Spring Boot Config Server and features smart server management that actually makes sense.

## Table of Contents

- [Config Tool](#config-tool)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
  - [Usage](#usage)
    - [Server Management](#server-management)
    - [Decrypting Values](#decrypting-values)
    - [Encrypting Values](#encrypting-values)
  - [Commands](#commands)
  - [Settings](#settings)
    - [Server Configuration](#server-configuration)
    - [Server Selection Rules](#server-selection-rules)
    - [Placeholder Types](#placeholder-types)
    - [Settings Reference](#settings-reference)
  - [Troubleshooting](#troubleshooting)
  - [Requirements](#requirements)
  - [Privacy](#privacy)
  - [Contributing](#contributing)
  - [Changelog](#changelog)

## Features ✨

- **Encrypt**: Turn plain text into secure `{cipher}` values with visual feedback
- **Decrypt**: Transform `{cipher}` values back to readable text with progress tracking
- **Smart Server Selection**: Automatically picks the right config server using file paths and git branches (it's like magic! 🪄)
- **Flexible Configuration**: Create custom rules with regex patterns - as simple or complex as you need
- **Server Management**: Pin servers to lock them in place or let the extension auto-select for you
- **Batch Processing**: Handle one value, hundreds, or entire files - we don't judge
- **Keyboard Shortcuts**: Lightning-fast access with customizable shortcuts, plus ESC to cancel anytime

## Usage

### Server Management

The extension automatically selects the appropriate config server using configurable rules that can match:
- File path patterns with regex capture groups
- Git branch information for regional server selection
- Custom hint-based placeholders with substitution mappings

The status bar shows the current server with icons and detailed tooltips:
- 🔒 (lock): Server is pinned - "Current config server: [name] (pinned)"
- ✅ (check): Only one server configured - "Current config server: [name] (only server configured)"
- ✨ (sparkle): Server auto-selected - "Current config server: [name] (auto-selected)"
- ⚠️ (warning): No server selected - "No config server selected - [reason]"

### Decrypting Values

1. Open a file containing encrypted values in the format `{cipher}EncryptedValue`
2. Run the command **Config Tool: Decrypt** or press `Ctrl+Alt+D` (`Cmd+Alt+D` on Mac)
3. Watch the progress in the status bar as cipher values are highlighted and decrypted
4. Full cipher patterns and encrypted text are highlighted with different decorations
5. Press `ESC` to cancel the operation if needed

### Encrypting Values

1. Select the plain text you want to encrypt
2. Run the command **Config Tool: Encrypt** or press `Ctrl+Alt+E` (`Cmd+Alt+E` on Mac)
3. Watch the progress as selected text is highlighted and replaced with `{cipher}EncryptedValue`
4. Press `ESC` to cancel the operation if needed

## Commands

| Command | Keyboard Shortcut | Description |
|---------|-------------------|-------------|
| `Config Tool: Decrypt` | `Ctrl+Alt+D` / `Cmd+Alt+D` | Decrypt all {cipher} values in the current document or selection |
| `Config Tool: Encrypt` | `Ctrl+Alt+E` / `Cmd+Alt+E` | Encrypt selected text using the config server |
| `Config Tool: Select Server` | `Ctrl+Alt+S` / `Cmd+Alt+S` | Manually choose a config server |
| `Config Tool: Pin Current Server` | `Ctrl+Alt+P` / `Cmd+Alt+P` | Pin the current server to prevent auto-switching |
| `Config Tool: Unpin Server` | `Ctrl+Alt+U` / `Cmd+Alt+U` | Allow automatic server detection |
| `Config Tool: Cancel Operation` | `ESC` | Cancel ongoing encrypt/decrypt operations |

## Settings

**Quick Setup:** Open Settings (`Ctrl+,`) and search for "Config Tool" to get started - it's easier than you think! 🚀

### Server Configuration

**Basic Server Mapping:**
```json
{
  "configTool.servers": {
    "ng-dev": "https://ng-config-server.dev.example.com/config-server",
    "ng-us-stage": "https://ng-config-server-us.stage.example.com/config-server",
    "apg-prod": "https://apg-config-server.prod.example.com/configserver"
  }
}
```

### Server Selection Rules

**Automatic Server Selection:**
```json
{
  "configTool.serverSelectors": [
    {
      "name": "APG Config Store",
      "pattern": "[/\\\\]gce-apg-config-store[/\\\\]([^/\\\\]+)[/\\\\]",
      "serverKey": "apg-$1"
    },
    {
      "name": "NG Config Store with Regional Support",
      "pattern": "[/\\\\]gce-ng-config-store[/\\\\][^/\\\\]+[/\\\\][^/\\\\]+-(\\w+)\\.ya?ml$",
      "serverKey": "ng-{git:ancestorRegion[develop=,develop-US=us-]}$1"
    }
]
}
```

### Placeholder Types

- **Regex Groups**: `$1`, `$2`, etc. - Captured from the pattern
- **Inline Mapping**: `{git:ancestorRegion[develop=,develop-US=us-]}` - Maps ancestor branch to region prefix

### Settings Reference

- `configTool.servers`: Server key to URL mappings
- `configTool.autoSelectServer`: Enable automatic server selection using serverSelectors
- `configTool.serverSelectors`: Array of selection rules with pattern matching and templating

## Troubleshooting 🔧

**Check the Logs:** If something goes wrong, check the **Output** panel (`View > Output`) and select **"Config Tool - Encrypt/Decrypt"** from the dropdown. The extension logs all operations, errors, and debug information there - it's like a detective's notebook! 🕵️

**Need More Details?** Set VS Code's log level to Debug (`Developer > Set Log Level > Debug`) for extra verbose logging.

**Common Issues:**
- **"No server selected"** - Click the status bar to pick a server
- **Network errors** - Check your config server URL and network connection
- **Auto-selection not working** - Verify your `serverSelectors` patterns match your file paths

## Requirements

- VS Code 1.54.0 or higher
- Network access to the Spring Boot Config Server

## Privacy

This extension respects your privacy and operates entirely locally. See [PRIVACY.md](PRIVACY.md) for detailed information about data handling and privacy practices.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup and contribution guidelines.

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for detailed release history and [GitHub Releases](https://github.com/tenerity-bbc/ext-vscode-config-tool/releases) for downloadable packages.