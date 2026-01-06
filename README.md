# Book Translation App

CLI tool for managing book translations.

## Environment Variables

- `APP_DB_PATH`: Path to SQLite database (default: `data/book-translations.sqlite`)
- `OPENAI_API_KEY`: API key for OpenAI (used by `ai-sdk` provider)
- `DEEPL_API_KEY`: API key for DeepL (used by `deepl` provider)

## Usage

See [specs/001-book-translation-app/quickstart.md](specs/001-book-translation-app/quickstart.md) for examples.

## Export Command

Export books to JSON, Markdown, or DOCX:

```bash
npm run cli -- book export <book-slug> --output <dir> --format docx
```

Options:
- `--format`: json, md, docx (default: all)
- `--chapter`: Export specific chapter
- `--languages`: Filter translations (e.g., `tr`, `en`)
- `--provider`: Filter translations by specific provider
- `--no-source`: Do not include the source text in the export
- `--fallback`: Pick an alternative provider if the requested one is missing for a verse
- `--include-numbers`: Include chapter:verse numbers (e.g. "1:5") before verses
- `--output`: Output directory

### Example: Export Clean Turkish Translation
To export a Word document with only Turkish translations using 'Sonnet-4.5' (with fallback if needed):

```bash
npm run cli -- book export bhagavad-gita -f docx -l tr -p Sonnet-4.5 --fallback --no-source --output ./exports
```

```
 npm run cli -- book export bhagavad-gita -f docx -l tr -p Sonnet-4.5 --fallback --no-source  --output exports/bhagavad-gita-turkish
 ```