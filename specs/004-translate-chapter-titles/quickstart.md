# Quickstart: Translate Chapter Titles

## Setup
Ensure migrations are run to create the `chapter_translations` table.

```bash
npm run migrate
```

## Import Titles
Import a JSON file that contains `title_turkish`.

```bash
npm run cli -- import ./Bhagavad-Gita/Claude-Sonnet-4.5/Chapter-01.json
```

## Translate Titles
Translate missing titles for a book using an AI provider.

```bash
# This is a proposed command structure
npm run cli -- translate-titles --book bhagavad-gita --lang tr --provider openai
```

## Export Titles
Export the book to see the translated titles in the output.

```bash
npm run cli -- export --book bhagavad-gita --lang tr --format md
```
