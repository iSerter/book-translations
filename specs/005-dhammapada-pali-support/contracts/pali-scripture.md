# Pali Scripture File Format

**Format ID**: `pali-scripture`

## Schema

```typescript
type PaliScripture = {
  format: "pali-scripture";
  book: {
    slug: string;
    title: string;
    author?: string;
    chapters: Array<{
      number: number;
      title_pali: string; // Replaces title_sanskrit
      verses: Array<{
        number: number;
        pali: string;     // Replaces sanskrit
      }>;
    }>;
  };
};
```

## Example

```json
{
  "format": "pali-scripture",
  "book": {
    "slug": "dhammapada",
    "title": "Dhammapada",
    "chapters": [
      {
        "number": 1,
        "title_pali": "Yamaka Vagga",
        "verses": [
          {
            "number": 1,
            "pali": "Manopubbaṅgamā dhammā, manoseṭṭhā manomayā;"
          }
        ]
      }
    ]
  }
}
```
