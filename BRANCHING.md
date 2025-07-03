# Git Flow Branching Strategy

## Branch Structure

### **master** (Production)
- **Purpose**: Production-ready releases
- **Triggers**: Automated releases to VS Code Marketplace
- **Protection**: Requires PR review, no direct commits
- **Merges from**: `develop` via release PRs

### **develop** (Integration)
- **Purpose**: Integration of completed features
- **Triggers**: Pre-release builds and testing
- **Merges from**: `feature/*`, `bugfix/*` branches
- **Merges to**: `master` for releases

### **feature/** (Feature Development)
- **Purpose**: New feature development
- **Naming**: `feature/feature-name`
- **Base**: `develop`
- **Merges to**: `develop` via PR

### **bugfix/** (Bug Fixes)
- **Purpose**: Non-critical bug fixes
- **Naming**: `bugfix/issue-description`
- **Base**: `develop`
- **Merges to**: `develop` via PR

### **hotfix/** (Emergency Fixes)
- **Purpose**: Critical production fixes
- **Naming**: `hotfix/critical-issue`
- **Base**: `master`
- **Merges to**: Both `master` and `develop`

## Workflow

1. **Feature Development**:
   ```bash
   git checkout develop
   git checkout -b feature/new-feature
   # ... develop feature
   # Create PR: feature/new-feature → develop
   ```

2. **Release Process**:
   ```bash
   # Create PR: develop → master
   # After merge, automated release triggers
   ```

3. **Hotfix Process**:
   ```bash
   git checkout main
   git checkout -b hotfix/critical-fix
   # ... fix issue
   # Create PR: hotfix/critical-fix → master
   # Create PR: hotfix/critical-fix → develop
   ```

## CI/CD Behavior

- **develop**: Runs tests, creates pre-release artifacts
- **master**: Runs tests, creates production release
- **feature/bugfix**: Validates via PR checks
- **hotfix**: Validates and releases immediately