# Book Translation App

CLI tool for managing book translations, generating chapter content using AI, and exporting to various formats.

## Environment Variables

- `APP_DB_PATH`: Path to SQLite database (default: `data/book-translations.sqlite`)
- `OPENAI_API_KEY`: API key for OpenAI (used by `ai-sdk` provider)
- `DEEPL_API_KEY`: API key for DeepL (used by `deepl` provider)

## Setup

First, install dependencies:

```bash
npm install
```

Then, initialize the database and run migrations:

```bash
npm run cli -- db migrate
```

You can also seed the database with default prompt templates:

```bash
npm run cli -- db seed
```

## Usage

### Database Management

Clear and re-initialize the database (useful for development):

```bash
rm -f data/book-translations.sqlite
npm run cli -- db migrate
```

### Importing Content

Import translation data from JSON files. This command infers the provider and model from the file path if not specified.

```bash
# Import a single file
npm run cli -- translations import "path/to/chapter.json" --provider Sonnet-4.5 --book-slug bhagavad-gita

# Bulk import using glob
npm run cli -- translations import "Bhagavad-Gita/Claude-Sonnet-4.5/*.json" --provider Sonnet-4.5 --book-slug bhagavad-gita
```

### Generating Chapters

Generate new chapter content using an AI provider and a prompt template:

```bash
npm run cli -- chapter generate --book bhagavad-gita --chapter 1 --expected-verses 47 --template "sanskrit-gita" --provider ai-sdk --model gpt-4o
```

### Translating Titles and Verses

#### Translate Chapter Titles
Batch translate chapter titles for a book:

```bash
npm run cli -- chapter translate --book bhagavad-gita --chapters 1,2,3 --to tr --provider openai
```

#### Translate Verses
Translate specific verses for a chapter:

```bash
npm run cli -- verse translate --book bhagavad-gita --chapter 1 --verses 1,2,3 --to tr --provider openai
```

### Exporting Books

Export books to JSON, Markdown, or DOCX formats:

```bash
npm run cli -- book export <book-slug> --output <dir> --format <json|md|docx>
```

#### Common Export Scenarios

**Export Clean Turkish Translation (DOCX)**
Export only Turkish translations, no source text, with verse numbers:

```bash
npm run cli -- book export bhagavad-gita --format docx --languages tr --provider Sonnet-4.5 --fallback --no-source --include-numbers --output ./exports/bhagavad-gita-turkish
```

**Export JSON for Further Processing**
```bash
npm run cli -- book export bhagavad-gita --format json --output ./exports/json-export
```

## Development

Run tests:

```bash
npm test
```

Build the project:

```bash
npm run build
```
