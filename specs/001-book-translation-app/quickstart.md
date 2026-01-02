# Quickstart: Book Translation App

This repository is CLI-first. The feature spec describes workflows to store book structure, generate first-pass chapter content, translate verses, and retrieve translations.

## Assumed Tech Stack
- Node.js v24
- SQLite (local file)

## Local Development (Expected)

1. Install dependencies
- `npm install`

2. Run tests (TDD)
- `npm test`

3. Example CLI flows (conceptual)

Store a book structure:
- `node ./dist/cli.js book store --file Bhagavad-Gita/misc/Bhagavad-Gita-English-Translation-01.json --json`

Generate first-pass chapter content from a template:
- `node ./dist/cli.js chapter generate --book "Bhagavad-Gita" --chapter 1 --expected-verses 47 --template "gita-first-pass" --provider ai-sdk.openai --json`

Translate specific verses:
- `node ./dist/cli.js verse translate --book "Bhagavad-Gita" --chapter 2 --verses 11,12 --to en --provider deepl --json`

Retrieve translations:
- `node ./dist/cli.js translations get --book "Bhagavad-Gita" --chapter 2 --verse 11 --json`

## Output Contract
- With `--json`, stdout contains JSON only.
- Human-readable logs and all errors go to stderr.

