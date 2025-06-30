# Config Tool

A VS Code extension for encrypting and decrypting configuration values using Spring Boot Config Server with intelligent server management.

## Features

- **Decrypt cipher values**: Automatically finds and decrypts `{cipher}` encrypted values in your configuration files
- **Encrypt plain text**: Select text and encrypt it using the config server
- **Smart server detection**: Automatically determines the appropriate config server based on file path and Git branch
- **Server management**: Pin/unpin servers, manual server selection with status bar integration
- **Multi-environment support**: Pre-configured servers for NG and APG environments (dev, qa, stage, prod)
- **Regional support**: Automatic US region detection based on Git branch naming
- **Batch processing**: Process multiple selections or entire documents at once

## Usage

### Server Management

The extension automatically detects the appropriate config server based on:
- File path patterns (e.g., `gce-ng-config-store`, `gce-apg-config-store`)
- Environment from filename (e.g., `application-dev.yml`)
- Git branch for regional detection (branches ending with `-US`)

The status bar shows the current server with icons:
- 🔒 (lock): Server is pinned
- ✨ (sparkle): Server auto-determined
- ⚠️ (warning): No server selected

### Decrypting Values

1. Open a file containing encrypted values in the format `{cipher}EncryptedValue`
2. Run the command **Config Tool: Decrypt** (Ctrl+Shift+P)
3. All cipher values in the document will be decrypted automatically

### Encrypting Values

1. Select the plain text you want to encrypt
2. Run the command **Config Tool: Encrypt** (Ctrl+Shift+P)
3. The selected text will be replaced with `{cipher}EncryptedValue`

## Commands

- `Config Tool: Decrypt` - Decrypt all {cipher} values in the current document or selection
- `Config Tool: Encrypt` - Encrypt selected text using the config server
- `Config Tool: Select Server` - Manually choose a config server
- `Config Tool: Pin Current Server` - Pin the current server to prevent auto-switching
- `Config Tool: Unpin Server` - Allow automatic server detection

## Requirements

- Network access to the Spring Boot Config Server
- VS Code 1.54.0 or higher

## Release Notes

### 0.0.1

Initial release with encrypt/decrypt functionality for Spring Boot Config Server.
