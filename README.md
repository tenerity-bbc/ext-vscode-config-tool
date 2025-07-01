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
    - [Key Format Rules:](#key-format-rules)
    - [Examples:](#examples)
  - [Requirements](#requirements)
  - [Release Notes](#release-notes)
    - [0.0.1](#001)

## Features

- **Decrypt cipher values**: Automatically finds and decrypts `{cipher}` encrypted values in your configuration files
- **Encrypt plain text**: Select text and encrypt it using the config server
- **Progress tracking**: Real-time status bar progress indicator during operations
- **Visual feedback**: Text highlighting shows what's being processed with dual decorations for decryption
- **Cancellation support**: Press ESC to cancel ongoing operations at any time
- **Smart server detection**: Automatically determines the appropriate config server based on file path and Git branch
- **Server management**: Pin/unpin servers, manual server selection with status bar integration
- **Multi-environment support**: Pre-configured servers for NG and APG environments (dev, qa, stage, prod)
- **Regional support**: Automatic US region detection based on Git branch naming
- **Batch processing**: Process multiple selections or entire documents at once
- **Smart selection**: Works with selected text or entire document
- **Keyboard shortcuts**: Quick access to all commands via customizable key bindings

## Usage

### Server Management

The extension automatically detects the appropriate config server based on:
- File path patterns (e.g., `gce-ng-config-store`, `gce-apg-config-store`)
- Environment from filename (e.g., `application-dev.yml`)
- Git branch ancestry and regional detection (checks if current branch is descendant of `develop` or `develop-US`)

The status bar shows the current server with icons:
- 🔒 (lock): Server is pinned
- ✨ (sparkle): Server auto-determined
- ⚠️ (warning): No server selected

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

**Quick Setup:** [Open Config Tool Settings](command:workbench.action.openSettings?%5B%22configTool%22%5D) to add or update config servers

**Key Format:** `{configServerName}-{region}-{environment}`
- `configServerName`: `ng` or `apg`
- `region`: `us` (US only, omit for others)
- `environment`: `dev`, `qa`, `stage`, `prod`

**Example Configuration:**
```json
{
  "configTool.servers": {
    "ng-qa": "https://ng.example-server/config-server",
    "ng-us-stage": "https://ng-us.example-server/config-server",
    "apg-dev": "https://apg.example-server/configserver"
  }
}
```

## Requirements

- VS Code 1.54.0 or higher
- Network access to the Spring Boot Config Server

## Release Notes

### 0.0.1

**New Features:**
- Progress tracking with status bar indicators
- Real-time visual feedback with text highlighting
- Dual decorations for decryption (full pattern + cipher text)
- Keyboard shortcuts for all commands
- Operation cancellation with ESC key
- Immediate edit application for better user experience
- Reverse processing to prevent range invalidation
- Consolidated command registration

**Initial Features:**
- Encrypt/decrypt functionality for Spring Boot Config Server
- Smart server detection and management
- Multi-environment and regional support