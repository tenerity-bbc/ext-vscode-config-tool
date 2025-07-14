# Config Tool

A VS Code extension for encrypting and decrypting configuration values using Spring Boot Config Server. Features automatic server selection and batch processing to help manage your configuration secrets.

## Table of Contents

- [Config Tool](#config-tool)
  - [Table of Contents](#table-of-contents)
  - [Features ✨](#features-)
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
  - [Troubleshooting 🔧](#troubleshooting-)
  - [Requirements](#requirements)
  - [Privacy](#privacy)
  - [Local Development](#local-development)
  - [Contributing](#contributing)
  - [Changelog](#changelog)

## Features ✨

- **Encrypt**: Convert selected text into secure `{cipher}` values with visual feedback
- **Decrypt**: Transform `{cipher}` values back to readable text with progress tracking
- **Auto Server Selection**: Automatically chooses the right config server using file paths and git branches (it's like magic! 🪄)
- **Flexible Configuration**: Create custom selection rules with regex patterns
- **Server Management**: Pin servers to prevent auto-switching or let the extension choose for you
- **Batch Processing**: Handle single values or entire files in one operation
- **Keyboard Shortcuts**: Quick access with customizable shortcuts, plus ESC to cancel operations anytime

## Usage

### Server Management

The extension automatically selects the appropriate config server using configurable rules that can match:
- File path patterns with regex capture groups
- Git branch information for regional server selection
- Custom hint-based placeholders with substitution mappings

The status bar shows the current server with icons, background colors, and detailed tooltips:
- 🔒 (lock): Server is pinned - "Current config server: [name] (pinned)"
- ✅ (check): Only one server configured - "Current config server: [name] (only server configured)"
- ✨ (sparkle): Server auto-selected - "Current config server: [name] (auto-selected)"
- ⚠️ (warning): Auto-selection issues with warning background:
  - "No Selectors" - Auto-selection enabled but no selectors configured
  - "Not Selected" - Auto-selection enabled but no rules matched current file
- ❌ (error): "No Servers" with error background - No servers configured
- 📋 (list): "Select Server" - Auto-selection disabled, manual selection needed

### Decrypting Values

1. Open a file containing encrypted values in the format `{cipher}EncryptedValue`
2. Run the command **Config Tool: Decrypt** or press `Ctrl+Alt+D` (`Cmd+Alt+D` on Mac)
3. The extension will find and decrypt all cipher values in the document (or selection if text is selected)
4. Progress is shown in the status bar with visual highlighting of values being processed
5. Press `ESC` to cancel the operation if needed

### Encrypting Values

1. Select the plain text you want to encrypt (multiple selections supported)
2. Run the command **Config Tool: Encrypt** or press `Ctrl+Alt+E` (`Cmd+Alt+E` on Mac)
3. Selected text is highlighted and replaced with `'{cipher}EncryptedValue'` format
4. Press `ESC` to cancel the operation if needed

**Note**: The encrypt command is only available when text is selected and a server is configured.

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

**Quick Setup:** Open Settings (`Ctrl+,`) and search for "Config Tool" to configure your servers and selection rules.

### Server Configuration

**Basic Server Mapping:**
```json
{
  "configTool.servers": {
    "stark-stage": "https://localhost:8443",
    "stark-prod": "https://localhost:8444",
    "shield-stage": "https://localhost:8443",
    "shield-prod": "https://localhost:8444"
  }
}
```

### Server Selection Rules

**Automatic Server Selection:**
```json
{
  "configTool.serverSelectors": [
    {
      "name": "Stark Industries",
      "pattern": "[/\\\\]stark-industries[/\\\\]([^/\\\\]+)[/\\\\]",
      "serverKey": "stark-$1"
    },
    {
      "name": "SHIELD Tech",
      "pattern": "[/\\\\]shield-tech[/\\\\][^/\\\\]+[/\\\\][^/\\\\]+-(\\w+)\\.ya?ml$",
      "serverKey": "shield-$1"
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

**Check the Logs:** If something goes wrong, check the **Output** panel (`View > Output`) and select **"Config Tool - Encrypt/Decrypt"** from the dropdown. The extension logs all operations, errors, and debug information there.

**Need More Details?** Set VS Code's log level to Debug (`Developer > Set Log Level > Debug`) for extra verbose logging.

**Common Issues:**
- **"No server selected"** - Click the status bar to pick a server or configure server settings
- **Commands disabled** - Encrypt/decrypt commands are only enabled when a server is selected
- **Network errors** - Check your config server URL and network connection
- **Auto-selection not working** - Verify your `serverSelectors` patterns match your file paths
- **HTTPS certificate errors** - For development, you may need to set `NODE_TLS_REJECT_UNAUTHORIZED=0`

## Requirements

- VS Code 1.54.0 or higher
- Network access to the Spring Boot Config Server

## Privacy

This extension respects your privacy and operates entirely locally. See [PRIVACY.md](PRIVACY.md) for detailed information about data handling and privacy practices.

## Local Development

The `local-dev/` folder contains a complete Docker setup with Spring Boot Config Servers and sample configurations for testing.

**Quick Start:**
```bash
npm run dev:up    # Start config servers
npm run dev:down  # Stop servers
```

See [local-dev/README.md](local-dev/README.md) for detailed setup instructions and demo scenarios.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup and contribution guidelines.

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for detailed release history and [GitHub Releases](https://github.com/tenerity-bbc/ext-vscode-config-tool/releases) for downloadable packages.