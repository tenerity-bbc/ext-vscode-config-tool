# Config Tool

A VS Code extension for encrypting and decrypting configuration values using Spring Boot Config Server.

## Features

- **Decrypt cipher values**: Automatically finds and decrypts `{cipher}` encrypted values in your configuration files
- **Encrypt plain text**: Select text and encrypt it using the config server
- **Batch processing**: Process multiple selections or entire documents at once
- **Smart selection**: Works with selected text or entire document

## Usage

### Decrypting Values

1. Open a file containing encrypted values in the format `{cipher}EncryptedValue`
2. Run the command **Config Tool: Decrypt** (Ctrl+Shift+P)
3. All cipher values in the document will be decrypted automatically

### Encrypting Values

1. Select the plain text you want to encrypt
2. Run the command **Config Tool: Encrypt** (Ctrl+Shift+P)
3. The selected text will be replaced with `'{cipher}EncryptedValue'`

## Commands

- `Config Tool: Decrypt` - Decrypt all {cipher} values in the current document or selection
- `Config Tool: Encrypt` - Encrypt selected text using the config server

## Requirements

- Network access to the Spring Boot Config Server
- VS Code 1.54.0 or higher

## Release Notes

### 0.0.1

Initial release with encrypt/decrypt functionality for Spring Boot Config Server.
