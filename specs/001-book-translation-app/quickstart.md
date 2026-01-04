# Quickstart: Book Translation App

This repository is CLI-first. The feature spec describes workflows to store book structure, generate first-pass chapter content, translate verses, and retrieve translations.

## Assumed Tech Stack
- Node.js v24
- SQLite (local file)

## Local Development

1. Install dependencies
- `npm install`

2. Run tests (TDD)
- `npm test`

3. Example CLI flows

**Build**
```bash
npm run build
```

**Store a book structure**
```bash
node ./dist/cli/index.js book store --file Bhagavad-Gita/misc/Bhagavad-Gita-English-Translation-01.json --json
```

**Add a prompt template**
```bash
node ./dist/cli/index.js template add --name "gita-first-pass" --file Bhagavad-Gita/translation-prompt.md --json
```

**Generate first-pass chapter content from a template**
```bash
node ./dist/cli/index.js chapter generate --book "bhagavad-gita" --chapter 1 --expected-verses 47 --template "gita-first-pass" --provider ai-sdk --json
```

**Translate specific verses**
```bash
node ./dist/cli/index.js verse translate --book "bhagavad-gita" --chapter 2 --verses 11,12 --to es --provider fake --json
```

**Retrieve translations**
```bash
node ./dist/cli/index.js translations get --book "bhagavad-gita" --chapter 2 --verse 11 --json
```

## Output Contract
- With `--json`, stdout contains JSON only.
- Human-readable logs and all errors go to stderr.