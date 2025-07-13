# Config Tool Local Development Setup 🚀

Your local playground for testing the Config Tool extension! Complete with Spring Boot Config Servers and sample configurations that actually make sense.

## Quick Start

**Ready to dive in?** It's easier than you think! 🎯

1. **Fire up the Config Servers**:
   ```bash
   docker-compose up -d
   ```

2. **Configure VS Code**:
   - Copy settings from `vscode-settings.json` to your VS Code settings
   - Or use: `Ctrl+Shift+P` → "Preferences: Open Settings (JSON)"

3. **Watch the Magic Happen** ✨:
   - Open files in `config-stores/` folders
   - Watch the status bar for auto-server selection (it's like magic! 🪄)
   - Try encrypting/decrypting values and see them transform

## Available Servers

- **SHIELD Tech**: https://localhost:8443 (encrypt key: `Hail-Hydra`)
- **Stark Industries**: https://localhost:8444 (encrypt key: `LoveYou3000`)

## Config Stores Structure

```
config-stores/
├── shield-tech/          # SHIELD Tech configurations
└── stark-industries/     # Stark Industries configurations
```

## Demo Scenarios 🎬

### 1. Auto Server Selection Magic
- Open files in `config-stores/stark-industries/stage/` folder
- Status bar should show "stark-stage" server (watch it happen automatically!)
- Open files in `config-stores/shield-tech/prod/` folder  
- Status bar should show "shield-prod" server

### 2. Encryption Demo
- Open any configuration file in the config-stores
- Select plain text values (passwords, secrets, you name it)
- Press `Ctrl+Alt+E` to encrypt
- Watch them transform to `{cipher}...` (pretty cool, right? 😎)

### 3. Decryption Demo
- Open files with existing `{cipher}` values
- Press `Ctrl+Alt+D` to decrypt all cipher values
- Watch them transform back to plain text (like unwrapping a present! 🎁)

## Cleanup

**All done testing?** Clean up with:
```bash
docker-compose down
```