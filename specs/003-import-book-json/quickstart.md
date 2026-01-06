# Quickstart: Importing Book Translations

This guide explains how to import book content from JSON files into the database.

## Prerequisites

- JSON files formatted according to the [Import Schema](./contracts/json-schema.md).
- Access to the CLI tool.

## Basic Usage

1.  **Prepare your JSON file**: Ensure your file (e.g., `chapter-01.json`) has the correct structure.

2.  **Run the import command**:

    ```bash
    npm run cli -- translations import --book-slug bhagavad-gita "path/to/chapter-01.json"
    ```

3.  **Verify import**:

    ```bash
    npm run cli -- translations get --book bhagavad-gita --chapter 1 --verse 1
    ```

## Bulk Import

To import all chapters from a directory:

```bash
npm run cli -- translations import --book-slug bhagavad-gita "Bhagavad-Gita/Claude-Sonnet-4.5/*.json"
```

## Options

- `--dry-run`: Use this to check if your files are valid without modifying the database.
  ```bash
  npm run cli -- translations import --dry-run "path/to/*.json"
  ```
