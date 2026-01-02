<!--
Sync Impact Report:
- Version change: new → 1.0.0
- List of modified principles: All principles added (Accuracy and Integrity, CLI-First Interface, Test-First Development, Data Persistence, Simplicity and Modularity)
- Added sections: Technology Stack, Development Workflow
- Removed sections: None
- Templates requiring updates: None (project initialization)
- Follow-up TODOs: None
-->

# Book Translation App Constitution

## Core Principles

### I. Accuracy and Integrity
Translations of holy scriptures must prioritize accuracy, preserve spiritual and philosophical meaning, and maintain reverence for sacred texts. All translations undergo verification for fidelity to original sources.

### II. CLI-First Interface
Every feature exposes functionality via command-line interface. Text in/out protocol: stdin/args → stdout, errors → stderr. Support JSON and human-readable formats for automation and scripting.

### III. Test-First Development (NON-NEGOTIABLE)
TDD mandatory: Tests written → User approved → Tests fail → Then implement. Red-Green-Refactor cycle strictly enforced. All code changes require corresponding tests.

### IV. Data Persistence
SQLite database for reliable storage of books, chapters, verses, and translations. Schema designed for hierarchical text structures with proper indexing for performance.

### V. Simplicity and Modularity
Start simple, follow YAGNI principles. Code organized in modular libraries. Node.js best practices: async/await, error handling, minimal dependencies.

## Technology Stack

Node.js v24 as runtime environment. SQLite for data storage. ai-sdk and deepl-node for AI-powered translations. Standard npm for package management. ESLint and Prettier for code quality.

## Development Workflow

Test-first development with comprehensive unit and integration tests. CLI interface testing for all features. Code reviews required for all changes. Automated testing in CI/CD pipeline. Documentation updates with code changes.

## Governance

Constitution supersedes all other practices. Amendments require documentation, team approval, and migration plan. All PRs/reviews must verify compliance. Complexity must be justified. Use constitution for runtime development guidance.

**Version**: 1.0.0 | **Ratified**: 2026-01-02 | **Last Amended**: 2026-01-02
