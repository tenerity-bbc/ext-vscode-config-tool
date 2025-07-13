# Config Tool Local Development Setup 🚀

Your local playground for testing the Config Tool extension! Complete with Spring Boot Config Servers and sample configurations that actually make sense.

## Quick Start

**Ready to dive in?** It's easier than you think! 🎯

1. **Fire up the Config Servers**:
   ```bash
   # From the project root (super convenient!)
   npm run dev:up
   
   # Or from local-dev folder
   cd local-dev && docker-compose up -d
   ```

2. **Start Debugging**:
   ```bash
   # Press F5 to debug - workspace opens automatically!
   # Or manually open the workspace:
   code local-dev/config-tool-dev.code-workspace
   ```

3. **Watch the Magic Happen** ✨:
   - Open files in `config-stores/` folders
   - Watch the status bar for auto-server selection (it's like magic! 🪄)
   - Try encrypting/decrypting values and see them transform

## Available Servers

### 🎯 Recommended: HTTP Endpoints (No SSL hassles!)

| Server | URL | Encrypt Key |
|--------|-----|-------------|
| **SHIELD Tech** | `http://localhost:8080` | `Hail-Hydra` |
| **Stark Industries** | `http://localhost:8081` | `LoveYou3000` |

### 🔒 Alternative: HTTPS Endpoints (Self-signed certificates)

| Server | URL | Encrypt Key |
|--------|-----|-------------|
| **SHIELD Tech** | `https://localhost:8443` | `Hail-Hydra` |
| **Stark Industries** | `https://localhost:8444` | `LoveYou3000` |

**For HTTPS**: If you get SSL certificate errors, set `NODE_TLS_REJECT_UNAUTHORIZED=0` and restart VS Code.

**🎉 Ready to Go**: The extension comes pre-configured with HTTP endpoints! Just start the Docker containers and press F5 to debug - the workspace opens automatically with everything set up! 🚀

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
# From the project root (super convenient!)
npm run dev:down

# Or from local-dev folder
cd local-dev && docker-compose down
```

## Bonus Scripts 🎁

- `npm run dev:up` - Start the config servers
- `npm run dev:down` - Stop and clean up
- `npm run dev:logs` - Watch server logs in real-time