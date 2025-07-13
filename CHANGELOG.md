# [1.4.0](https://github.com/tenerity-bbc/ext-vscode-config-tool/compare/v1.3.1...v1.4.0) (2025-07-13)


### Bug Fixes

* improve git utilities and repository detection ([25ea8ef](https://github.com/tenerity-bbc/ext-vscode-config-tool/commit/25ea8ef8e73c7ec1776b712b800cb0b911460c82))


### Features

* centralize configuration access with effective config handling ([aacde2c](https://github.com/tenerity-bbc/ext-vscode-config-tool/commit/aacde2cfb3ed7339dd7168dc4fb7602739d78ea9))
* **config:** add HTTP protocol support to configService ([0daa5aa](https://github.com/tenerity-bbc/ext-vscode-config-tool/commit/0daa5aab75be3d90647d113f05f70b17edf45dbb))
* improve error messages and logs with helpful, engaging content ([5942aa5](https://github.com/tenerity-bbc/ext-vscode-config-tool/commit/5942aa56c4e747efd74650b48dad0268a53bc364))
* **local-dev:** add complete local development environment ([e8a671c](https://github.com/tenerity-bbc/ext-vscode-config-tool/commit/e8a671cb3474966a36465317556dda53f641abe5))
* streamline development workflow with auto-workspace loading ([695085c](https://github.com/tenerity-bbc/ext-vscode-config-tool/commit/695085c99b608708ae97939de19539c9be63e25a))

## [1.3.1](https://github.com/tenerity-bbc/ext-vscode-config-tool/compare/v1.3.0...v1.3.1) (2025-07-11)


### Bug Fixes

* force version increment ([8a3ff3b](https://github.com/tenerity-bbc/ext-vscode-config-tool/commit/8a3ff3b8a8affd924203b26f15391d7f46dcdec6))

# [1.3.0](https://github.com/tenerity-bbc/ext-vscode-config-tool/compare/v1.2.0...v1.3.0) (2025-07-11)


### Bug Fixes

* correct debug logging in server selector rule processing ([2fc0c24](https://github.com/tenerity-bbc/ext-vscode-config-tool/commit/2fc0c24c6253b81b2c7b4514037cdcf8270bf456))


### Features

* add comprehensive logging for debugging and monitoring ([331f8c3](https://github.com/tenerity-bbc/ext-vscode-config-tool/commit/331f8c301550878d4cf03b0d1401d898824db80c))

# [1.2.0](https://github.com/tenerity-bbc/ext-vscode-config-tool/compare/v1.1.2...v1.2.0) (2025-07-06)


### Bug Fixes

* enable debugging with esbuild by adding source maps and fixing output paths ([596d5ac](https://github.com/tenerity-bbc/ext-vscode-config-tool/commit/596d5ac449dde3af7c000af6106e4ca94cab7157))


### Features

* add activation notification ([6b77bc3](https://github.com/tenerity-bbc/ext-vscode-config-tool/commit/6b77bc3430d9adc8e2e356b7017e77fc5a0a07ff))
* add error categorization and improve notifications ([7323881](https://github.com/tenerity-bbc/ext-vscode-config-tool/commit/7323881502c48b9ef2426763544f8a6cfb1d07bb))
* adjust selections to cover replaced values after operations ([f378d78](https://github.com/tenerity-bbc/ext-vscode-config-tool/commit/f378d7800899a2f7331caaee7bc4fd312ee8b6da))
* enhance package.json configuration and validation ([1dc59ad](https://github.com/tenerity-bbc/ext-vscode-config-tool/commit/1dc59ad12e9be77074c091ec3385c85d23eea7c9))
* enhance processing notifications with success indicators and counts ([aeea901](https://github.com/tenerity-bbc/ext-vscode-config-tool/commit/aeea9016972af8184abad2f2ba2ac057f369b2d3))
* enhance server selection with pin/unpin indicators ([cbfe7aa](https://github.com/tenerity-bbc/ext-vscode-config-tool/commit/cbfe7aa040c5986711c13851625b50ca30095ff4))
* externalize server selection logic to configurable rules ([5a52b13](https://github.com/tenerity-bbc/ext-vscode-config-tool/commit/5a52b139565130f26b03b319519940dc8e6a1cf0))
* improve context menu UX with enablement conditions ([46fdecc](https://github.com/tenerity-bbc/ext-vscode-config-tool/commit/46fdecc450a81b51ef8bc544c7d9ba7883ede64b))

## [1.1.2](https://github.com/tenerity-bbc/ext-vscode-config-tool/compare/v1.1.1...v1.1.2) (2025-07-04)


### Bug Fixes

* switch to esbuild bundling for proper dependency inclusion ([90a031a](https://github.com/tenerity-bbc/ext-vscode-config-tool/commit/90a031a32a64b5775c3cc355d73a4d2455ebd3b4))

## [1.1.1](https://github.com/tenerity-bbc/ext-vscode-config-tool/compare/v1.1.0...v1.1.1) (2025-07-04)


### Bug Fixes

* bundle isomorphic-git dependency to resolve runtime errors ([2f0f7ff](https://github.com/tenerity-bbc/ext-vscode-config-tool/commit/2f0f7ff0e18c4ab3ace21c79d6cec188b88e97cb))

# [1.1.0](https://github.com/tenerity-bbc/ext-vscode-config-tool/compare/v1.0.0...v1.1.0) (2025-07-03)


### Features

* implement complete Git Flow automation with branch protection and release management ([9ddf6a3](https://github.com/tenerity-bbc/ext-vscode-config-tool/commit/9ddf6a3a53b7fd41b512e79a1b17856e02b07ac4))

# 1.0.0 (2025-07-03)


### Bug Fixes

* add write permissions for semantic-release ([ceb94f4](https://github.com/tenerity-bbc/ext-vscode-config-tool/commit/ceb94f4c9655e3b0a3692f199ce9a7b1994c6673))
* add xvfb for headless VS Code testing in CI ([ddd9a30](https://github.com/tenerity-bbc/ext-vscode-config-tool/commit/ddd9a30a6a36fb6558c7a8e9b7dae60ab16988f2))
* remove hardcoded VS Code path for CI compatibility ([bed67a4](https://github.com/tenerity-bbc/ext-vscode-config-tool/commit/bed67a4b0aa8512f6e8fada0bf97deca87833ec6))
* temporarily skip failing tests for release ([a0758a8](https://github.com/tenerity-bbc/ext-vscode-config-tool/commit/a0758a8592447603fa63234ec9db1ab2581a3a68))
* update keyboard shortcuts to avoid VS Code conflicts ([8a4a049](https://github.com/tenerity-bbc/ext-vscode-config-tool/commit/8a4a0496df6a8052e0c7f0f17ba9f5bd7f5df072))
* update Node.js version to 20 for vsce compatibility ([5473c94](https://github.com/tenerity-bbc/ext-vscode-config-tool/commit/5473c9407f5175989cd5abd4f6f0fde3d5c5cc2f))


### Features

* add automated release and change management system ([f7c103e](https://github.com/tenerity-bbc/ext-vscode-config-tool/commit/f7c103ebc344da26abea86f0358bcc1234914cfb))
* add keyboard shortcuts and update documentation ([b11cffb](https://github.com/tenerity-bbc/ext-vscode-config-tool/commit/b11cffb8d28c7418ff88aa965e343a64e63ce7c5))
* add operation cancellation support ([6b5a982](https://github.com/tenerity-bbc/ext-vscode-config-tool/commit/6b5a982c28f30c14a8e720785c568ac8eef5c3ed))
* add progress tracking and visual feedback for cipher operations ([c31623e](https://github.com/tenerity-bbc/ext-vscode-config-tool/commit/c31623ea49b3696e1e634ce30a06f7ee6df011cf))
* implement Git branch-based region determination using isomorphic-git ([bb7f2b5](https://github.com/tenerity-bbc/ext-vscode-config-tool/commit/bb7f2b5d36becd10e9a5bc320f8ba1e285a9ed9a))

# Change Log

All notable changes to the Config Tool extension will be documented in this file. This extension provides encrypt/decrypt functionality for Spring Boot Config Server with intelligent server management.

The format is based on [Keep a Changelog](http://keepachangelog.com/).

**Note**: Starting from version 0.2.0, this changelog is automatically generated by semantic-release based on conventional commit messages.

## [0.1.0] - 2024-12-19

### Added
- `enableAutoSelection` setting to control automatic server selection
- Operation cancellation support with ESC key
- Progress tracking with status bar indicators
- Real-time visual feedback with text highlighting
- Comprehensive keyboard shortcuts for all commands
- Enhanced status bar with better icons and tooltips
- Selection retention after cipher operations
- View restoration after operations

### Changed
- Renamed terminology from "auto-determination" to "auto-selection" for clarity
- Improved server selection logic with single server auto-selection
- Updated keyboard shortcuts to avoid VS Code conflicts
- Enhanced service naming conventions and code organization

### Fixed
- Better git utility placement and structure
- Improved activation events for YAML files

## [0.0.1] - 2024-12-18

### Added
- Initial release with encrypt/decrypt functionality
- Smart server detection and management
- Multi-environment and regional support
- Spring Boot Config Server integration
