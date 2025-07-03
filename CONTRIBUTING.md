# Contributing to Config Tool

## Development Setup

1. Clone the repository
2. Run `npm install` to install dependencies
3. Open in VS Code and press F5 to launch extension development host

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

Releases are automated using semantic-release:

- **Patch releases** (0.1.0 → 0.1.1): `fix:` commits
- **Minor releases** (0.1.0 → 0.2.0): `feat:` commits  
- **Major releases** (0.1.0 → 1.0.0): `feat:` or `fix:` commits with `BREAKING CHANGE:` in footer

## Pull Request Process

1. Create a feature branch from `main`
2. Make your changes following the coding standards
3. Add tests for new functionality
4. Ensure all tests pass
5. Update documentation if needed
6. Submit a pull request with a clear description

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