# CLI Interface Changes

## `verse translate`

Updates the `verse translate` command to support source language specification.

**Command**:
```bash
verse translate --from <lang> ...
```

**Options**:
- `-l, --from <lang>`: (Optional) Source language code (e.g., 'pali', 'sa'). If omitted, behavior depends on provider default.

## `translations import`

Updates import logic to detect `pali-scripture` format.

**Command**:
```bash
translations import <file>
```

**Behavior**:
- Automatically detects `format: "pali-scripture"` in JSON.
- Validates against Pali schema.
- Maps `title_pali` -> `Chapter.title`.
- Maps `pali` -> `Verse.source_text`.

## `book generate` (Implicit)

If we add generation support, we might need a template for it.

**Command**:
```bash
book generate --template <template-name>
```

**Templates**:
- `dhammapada-pali`: Generates content in `pali-scripture` format.
