# Git Flow Branching Strategy 🌳

We use Git Flow because it keeps things organized and prevents chaos! Here's how our branches work:

## Branch Structure 🌱

### **master** (Production) 🏆
- **Purpose**: The golden branch - only production-ready code lives here!
- **Triggers**: Automated releases to VS Code Marketplace (the magic happens!)
- **Protection**: Fort Knox level - requires PR review, no sneaky direct commits
- **Merges from**: `develop` via release PRs (when we're confident it's ready)

### **develop** (Integration) 🔧
- **Purpose**: Where features come together and hopefully don't fight
- **Triggers**: Pre-release builds and testing (our safety net)
- **Merges from**: `feature/*`, `bugfix/*` branches (the building blocks)
- **Merges to**: `master` for releases (graduation day!)

### **feature/** (Feature Development) ✨
- **Purpose**: Your creative playground for new awesome stuff
- **Naming**: `feature/feature-name` (keep it descriptive!)
- **Base**: `develop` (start from the latest and greatest)
- **Merges to**: `develop` via PR (show off your work!)

### **bugfix/** (Bug Fixes) 🐛
- **Purpose**: Squashing those pesky bugs that aren't breaking everything
- **Naming**: `bugfix/issue-description` (tell us what you're fixing)
- **Base**: `develop` (fix it where it lives)
- **Merges to**: `develop` via PR (one less bug in the world!)

### **hotfix/** (Emergency Fixes) 🚑
- **Purpose**: When production is on fire and we need to act fast!
- **Naming**: `hotfix/critical-issue` (urgency in the name)
- **Base**: `master` (fix it at the source)
- **Merges to**: Both `master` and `develop` (fix everywhere!)

## Workflow 💼

1. **Feature Development** (The fun part!):
   ```bash
   git checkout develop
   git checkout -b feature/awesome-new-thing
   # ... build something cool
   # Create PR: feature/awesome-new-thing → develop
   ```

2. **Release Process** (Ship it!):
   ```bash
   # Create PR: develop → master
   # Sit back and watch the automation work its magic ✨
   ```

3. **Hotfix Process** (Emergency mode!):
   ```bash
   git checkout master  # (not main - we're old school here)
   git checkout -b hotfix/save-the-day
   # ... fix the critical issue
   # Create PR: hotfix/save-the-day → master
   # Create PR: hotfix/save-the-day → develop
   ```

## CI/CD Behavior 🤖

- **develop**: Runs tests, creates pre-release artifacts (making sure we didn't break anything)
- **master**: Runs tests, creates production release (the real deal!)
- **feature/bugfix**: Validates via PR checks (quality control checkpoint)
- **hotfix**: Validates and releases immediately (because production can't wait!)