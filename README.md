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
npm start -- book export <book-slug> --output <dir> --format json md docx
```

Options:
- `--format`: json, md, docx (default: all)
- `--chapter`: Export specific chapter
- `--languages`: Filter translations
- `--output`: Output directory