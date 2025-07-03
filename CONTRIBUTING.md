# Contributing to Config Tool

## Development Setup

1. Clone the repository
2. Run `npm install` to install dependencies
3. Open in VS Code and press F5 to launch extension development host

## Git Flow Branching Strategy

This project uses Git Flow. See [BRANCHING.md](BRANCHING.md) for detailed workflow.

### Quick Start:
```bash
# Feature development
git checkout develop
git checkout -b feature/your-feature-name
# ... make changes
# Create PR: feature/your-feature-name → develop

# Bug fixes
git checkout develop
git checkout -b bugfix/issue-description
# ... fix bug
# Create PR: bugfix/issue-description → develop

# Hotfixes
git checkout master
git checkout -b hotfix/critical-issue
# ... fix issue
# Create PR: hotfix/critical-issue → master
```

## Commit Message Format

This project uses [Conventional Commits](https://conventionalcommits.org/). Please format your commit messages as follows:

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Types
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools

### Examples
```
feat(encryption): add support for AES-256 encryption
fix(server): resolve connection timeout issues
docs: update README with new configuration options
```

## Release Process

Releases are **fully automated** using semantic-release:

1. **Develop Integration**: Features merge to `develop` branch
2. **Release Preparation**: Create PR from `develop` → `master`
3. **Automated Release**: Merge triggers automatic:
   - Version bumping based on commit types
   - Changelog generation
   - GitHub release creation
   - VS Code Marketplace publishing

### Version Bumping:
- **Patch releases** (0.1.0 → 0.1.1): `fix:` commits
- **Minor releases** (0.1.0 → 0.2.0): `feat:` commits  
- **Major releases** (0.1.0 → 1.0.0): `feat:` or `fix:` commits with `BREAKING CHANGE:` in footer

## Pull Request Process

### For Features/Bugfixes:
1. Create branch from `develop`: `feature/name` or `bugfix/name`
2. Make your changes following the coding standards
3. Add tests for new functionality
4. Ensure all tests pass
5. Update documentation if needed
6. Submit PR to `develop` branch

### For Releases:
1. Create PR from `develop` → `master`
2. Ensure all features are tested and ready
3. Merge triggers automated release

### For Hotfixes:
1. Create branch from `master`: `hotfix/critical-issue`
2. Fix the critical issue
3. Submit PR to `master` (triggers immediate release)
4. Also merge back to `develop`

## Testing

Run tests with:
```bash
npm test
```

## Code Style

This project uses ESLint. Run linting with:
```bash
npm run lint
```