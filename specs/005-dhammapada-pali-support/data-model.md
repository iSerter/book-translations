# Data Model: Dhammapada & Pali Support

## Database Schema (SQLite)

*No changes to the existing schema.*

### Table: `verses`
| Column | Type | Description | Mapping (Pali) |
|Refining|------|-------------|----------------|
| `source_text` | TEXT | The verse text in original language | Stores Romanized Pali text |

### Table: `chapters`
| Column | Type | Description | Mapping (Pali) |
|Refining|------|-------------|----------------|
| `title` | TEXT | Chapter title | Stores Pali title |

## Import/Export Format: `pali-scripture`

A JSON structure for exchanging Pali scriptures.

```json
{
  "format": "pali-scripture",
  "book": {
    "slug": "dhammapada",
    "title": "Dhammapada",
    "author": "Traditional",
    "chapters": [
      {
        "number": 1,
        "title_pali": "Yamaka Vagga",
        "verses": [
          {
            "number": 1,
            "pali": "Manopubban̄gamā dhammā..."
          }
        ]
      }
    ]
  }
}
```

### Validation Rules (Zod)

- `format`: Must be exactly "pali-scripture".
- `title_pali`: Required string.
- `pali`: Required string (Romanized text).
