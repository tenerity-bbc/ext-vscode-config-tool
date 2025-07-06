# Privacy Policy

**Effective Date:** January 2025  
**Extension:** Config Tool for VS Code  
**Publisher:** Tenerity BBC

## Overview

The Config Tool extension helps developers encrypt and decrypt configuration values using Spring Boot Config Server. This privacy policy explains how the extension handles data and protects user privacy.

## Data Collection

### What We Don't Collect
- **No personal information** is collected or transmitted
- **No usage analytics** or telemetry data is gathered
- **No user accounts** or authentication data is stored
- **No data is sent to Tenerity BBC** or any third-party services

### What Data the Extension Accesses
- **Configuration files** in your workspace (YAML/properties files)
- **Git repository information** (branch names for server selection)
- **VS Code settings** (server configurations you provide)

## Data Usage

### Local Data Storage
- **Server configurations** are stored locally in your VS Code workspace settings
- **No sensitive data** is permanently stored by the extension
- **Temporary data** (encrypted/decrypted values) exists only during operations

### Network Communication
- **Direct communication** only with Spring Boot Config Servers you configure
- **Encrypted requests** sent to your specified config server endpoints
- **No intermediary services** - all communication is point-to-point
- **Your data** never passes through our servers

### Git Integration
- **Branch information** is read locally to determine appropriate config server
- **Repository data** remains on your local machine
- **No git data** is transmitted externally

## Data Security

- **Local processing** - all operations happen on your machine
- **Secure transmission** - HTTPS communication with config servers
- **No data persistence** - temporary values are cleared after operations
- **User control** - you configure all server endpoints and credentials

## Error Logging

- **Local logs only** - errors are logged to VS Code's output panel
- **File paths** may appear in error messages (stored locally)
- **No automatic reporting** - logs are not transmitted anywhere
- **User accessible** - all logs are visible to you in VS Code

## User Rights and Control

### You Control
- **Server configurations** - you specify all endpoints
- **Data transmission** - operations only occur when you initiate them
- **Settings management** - you can modify or delete configurations anytime
- **Extension usage** - you can disable or uninstall at any time

### Data Deletion
- **Uninstall the extension** to remove all associated functionality
- **Clear VS Code settings** to remove server configurations
- **No external cleanup needed** - no data stored outside your machine

## Third-Party Services

- **Spring Boot Config Servers** - only those you configure
- **No analytics services** - no Google Analytics, telemetry, or tracking
- **No cloud services** - no AWS, Azure, or other cloud integrations
- **No advertising networks** - completely ad-free

## Changes to Privacy Policy

- **Updates** will be reflected in this document with a new effective date
- **Notification** through extension updates and changelog
- **Transparency** - all changes will be clearly documented

## Contact Information

For privacy-related questions or concerns:
- **GitHub Issues**: [Config Tool Repository](https://github.com/tenerity-bbc/ext-vscode-config-tool/issues)
- **Email**: Contact through GitHub repository

## Compliance

This extension:
- **Respects user privacy** by design
- **Minimizes data access** to only what's necessary for functionality
- **Operates transparently** with all operations visible to users
- **Follows VS Code extension guidelines** for privacy and security

---

**Summary**: Config Tool operates entirely locally and only communicates with config servers you specify. No personal data is collected, stored, or transmitted to any third parties.