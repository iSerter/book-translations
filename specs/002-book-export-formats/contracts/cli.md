# CLI Contract: Book Export

## Command: `book export`

Export book content to various file formats.

### Usage

```bash
book-translation-cli book export [options] <book-slug>
```

### Arguments

- `<book-slug>`: The unique identifier (slug) of the book to export.

### Options

| Option | Alias | Type | Default | Description |
|--------|-------|------|---------|-------------|
| `--format <formats...>` | `-f` | string[] | `['json', 'md', 'docx']` | List of formats to export. Allowed: `json`, `md`, `docx`. |
| `--chapter <number>` | `-c` | number | (all) | Export only a specific chapter number. |
| `--languages <codes...>` | `-l` | string[] | (all) | Filter translations to specific language codes (e.g. `en`, `es`). |
| `--output <path>` | `-o` | string | `./` | Output directory for generated files. |

### Output Files

Files are named using the pattern: `{book-slug}[_chapter-{N}].{ext}`

Examples:
- `bhagavad-gita.json`
- `bhagavad-gita_chapter-1.docx`

### Examples

1. **Export everything (defaults)**
   ```bash
   $ book export bhagavad-gita
   # Generates bhagavad-gita.json, bhagavad-gita.md, bhagavad-gita.docx
   ```

2. **Export only Chapter 5 to Markdown**
   ```bash
   $ book export bhagavad-gita --chapter 5 --format md
   # Generates bhagavad-gita_chapter-5.md
   ```

3. **Export only English and Spanish translations to JSON**
   ```bash
   $ book export bhagavad-gita --languages en es --format json
   # Generates bhagavad-gita.json containing only en/es translations
   ```
