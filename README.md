# Config Tool

A VS Code extension for encrypting and decrypting configuration values using Spring Boot Config Server with intelligent server management.

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
  - [Requirements](#requirements)
  - [Privacy](#privacy)
  - [Contributing](#contributing)
  - [Changelog](#changelog)

## Features

- **Decrypt cipher values**: Automatically finds and decrypts `{cipher}` encrypted values in your configuration files
- **Encrypt plain text**: Select text and encrypt it using the config server
- **Progress tracking**: Real-time status bar progress indicator during operations
- **Visual feedback**: Text highlighting shows what's being processed with dual decorations for decryption
- **Cancellation support**: Press ESC to cancel ongoing operations at any time
- **Smart server selection**: Configurable server determination using pattern matching and hint-based substitutions
- **Server management**: Pin/unpin servers, manual server selection with status bar integration
- **Flexible configuration**: Define custom server selection rules with regex patterns and placeholders
- **Git integration**: Automatic branch detection for region-specific server selection
- **Batch processing**: Process multiple selections or entire documents at once
- **Smart selection**: Works with selected text or entire document
- **Keyboard shortcuts**: Quick access to all commands via customizable key bindings

## Usage

### Server Management

The extension automatically selects the appropriate config server using configurable rules that can match:
- File path patterns with regex capture groups
- Git branch information for regional server selection
- Custom hint-based placeholders with substitution mappings

The status bar shows the current server with icons:
- 🔒 (lock): Server is pinned
- ✅ (check): Only one server configured (auto-selected)
- ✨ (sparkle): Server auto-selected from multiple options
- ⚠️ (warning): No server selected (auto-selection disabled)

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

**Quick Setup:** [Open Config Tool Settings](command:workbench.action.openSettings?%5B%22configTool%22%5D) to configure servers and selection rules

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
    "pattern": "[/\\\\]gce-apg-config-store[/\\\\]([^/\\\\]+)[/\\\\]",
    "serverKey": "apg-$1"
  },
  {
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

## Requirements

- VS Code 1.54.0 or higher
- Network access to the Spring Boot Config Server

## Privacy

This extension respects your privacy and operates entirely locally. See [PRIVACY.md](PRIVACY.md) for detailed information about data handling and privacy practices.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup and contribution guidelines.

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for detailed release history and [GitHub Releases](https://github.com/tenerity-bbc/ext-vscode-config-tool/releases) for downloadable packages.