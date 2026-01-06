# CLI Interface Contract

## Command: `translations import`

Import book content from JSON files.

### Usage

```bash
translations import [options] <file-pattern>
```

### Arguments

- `<file-pattern>`: Glob pattern to match JSON files (e.g., `Bhagavad-Gita/**/*.json`).

### Options

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `-b, --book-slug <slug>` | String | No | Slug of the book (e.g., `bhagavad-gita`). If omitted, inferred from path. |
| `-p, --provider <name>` | String | No | Translation provider name. If omitted, inferred from path. |
| `--dry-run` | Boolean | No | Parse and validate files without writing to DB. |

### Output

**Success (stdout):**
```text
Found 1 file(s) matching pattern.
Processing Bhagavad-Gita/Claude-Sonnet-4.5/Chapter-01.json...
  - Book: bhagavad-gita (found)
  - Chapter: 1 (created)
  - Verses: 47 (imported)
  - Translations: 94 (imported)
Import complete. 1 success, 0 failed.
```

**Failure (stderr):**
```text
Error processing file 'bad.json': Invalid JSON structure. Missing 'verses' array.
```
