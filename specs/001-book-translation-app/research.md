# Phase 0 Research: Book Translation App

## Decisions

### Runtime & Language
- Decision: Node.js v24, TypeScript
- Rationale: Constitution mandates Node.js v24 and Node best practices; TypeScript improves correctness for a data-heavy CLI (providers, persistence, validation) with minimal runtime cost.
- Alternatives considered:
  - JavaScript (simpler setup, but weaker guarantees for contracts and DB schema access).

### Testing
- Decision: `node:test` + `node:assert/strict` (optionally add `c8` later for coverage)
- Rationale: Constitution requires TDD; built-in runner keeps dependencies minimal and is well-suited to unit + integration + subprocess CLI tests.
- Alternatives considered:
  - Jest (heavier deps and config surface)
  - Vitest (excellent DX, but adds Vite ecosystem complexity)

### SQLite Access Library
- Decision: `better-sqlite3`
- Rationale: For a CLI, synchronous DB access is acceptable and yields a simpler, reliable API with easy prepared statements + transactions. This reduces bug surface and supports fast bulk inserts.
- Alternatives considered:
  - `sqlite3` (more boilerplate/callback ergonomics)
  - `sqlite` wrapper (nice async/await, but adds a layer; still native)
  - Prisma/Knex (overkill for a small, SQL-friendly domain)

### CLI Framework
- Decision: `commander`
- Rationale: Mature subcommand routing and help generation; makes it easy to keep CLI UX consistent while supporting both `--json` and text output and correct exit codes.
- Alternatives considered:
  - `yargs` (larger surface/deps)
  - `cac` (lighter, but may require more DIY conventions)
  - no-deps parsing (`node:util.parseArgs`) (insufficient for multi-command UX without re-implementing help/dispatch)

### Provider Integration Pattern
- Decision: Capability-based provider interfaces + standardized error taxonomy; use per-call deadlines (`AbortSignal.timeout`) and limited retries; write errors to stderr and keep JSON clean on stdout.
- Rationale: Meets FR-006 (graceful failures, no corruption) and constitution CLI-first contract; supports adding providers without rewriting CLI/storage.
- Alternatives considered:
  - Directly calling providers from CLI commands (tight coupling; harder to test and to add fallback/retry policies)

## Operational Best Practices (Applied)
- SQLite pragmas: `foreign_keys=ON`, `journal_mode=WAL`, `synchronous=NORMAL`, `busy_timeout`.
- Storage integrity: enforce uniqueness via constraints for book/chapter/verse and translation keys.
- CLI output contract: `--json` emits only JSON on stdout; human logs/errors go to stderr.

