# Config Tool

Encrypt and decrypt configuration values using Spring Boot Config Server with intelligent server management.

## Features

- Encrypt/decrypt configuration values
- Intelligent server management
- Support for multiple environments
- Pin/unpin servers for consistent usage

## Commands

- `Config Tool: Decrypt` - Decrypt selected configuration value
- `Config Tool: Encrypt` - Encrypt selected configuration value  
- `Config Tool: Select Server` - Choose config server
- `Config Tool: Pin Current Server` - Pin current server
- `Config Tool: Unpin Server` - Unpin current server

## Configuration

Configure your config servers in VS Code settings using the key format: `{configServerName}-{region}-{environment}`

### Key Format Rules:
- **configServerName**: `ng` or `apg`
- **region**: `us` (include only for US region, omit for other regions)
- **environment**: `dev`, `qa`, `stage`, `prod`

### Examples:
```json
{
  "configTool.servers": {
    "ng-qa": "https://ng.example-server/config-server",
    "ng-us-stage": "https://ng-us.example-server/config-server",
    "apg-dev": "https://apg.example-server/configserver",
    "apg-us-prod": "https://apg-us.example-server/configserver"
  }
}
```

## Requirements

- VS Code 1.54.0 or higher
- Access to Spring Boot Config Server

## Release Notes

### 0.0.1

Initial release with basic encrypt/decrypt functionality.