# Quickstart: Book Export

## Prerequisites
- Ensure you have the `book-translation-cli` installed and configured.
- Ensure you have a book stored in the database (e.g., `bhagavad-gita`).

## Basic Export
To export the "Bhagavad Gita" to all supported formats (JSON, Markdown, Word) in the current directory:

```bash
npm start -- book export bhagavad-gita
```

You should see:
- `bhagavad-gita.json`
- `bhagavad-gita.md`
- `bhagavad-gita.docx`

## Exporting a Single Chapter
To export only Chapter 1:

```bash
npm start -- book export bhagavad-gita --chapter 1
```

## Exporting Specific Formats
To export only the JSON data:

```bash
npm start -- book export bhagavad-gita --format json
```

## Filtering Languages
To export content with only English (`en`) translations:

```bash
npm start -- book export bhagavad-gita --languages en
```

## Custom Output Directory
To save files to a `dist` folder:

```bash
npm start -- book export bhagavad-gita --output ./dist
```
