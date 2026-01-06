# JSON Input Schema

The system expects JSON files adhering to the following structure.

## Schema Definition (TypeScript/Zod)

```typescript
import { z } from "zod";

const TranslationContentSchema = z.object({
  translation: z.string(),
  commentary: z.string().optional(),
});

const VerseSchema = z.object({
  verse_number: z.number(),
  sanskrit: z.string(),
  // Dynamic keys for languages (english, turkish, etc.)
  // or explicit optional keys if languages are fixed known set
  english: TranslationContentSchema.optional(),
  turkish: TranslationContentSchema.optional(),
});

const ChapterSchema = z.object({
  number: z.number(),
  title_sanskrit: z.string().optional(),
  title_english: z.string().optional(),
  total_verses: z.number().optional(),
  verses: z.array(VerseSchema),
});

const ImportFileSchema = z.object({
  chapter: ChapterSchema,
});
```

## Example JSON

```json
{
  "chapter": {
    "number": 1,
    "title_english": "The Yoga of Arjuna's Dejection",
    "verses": [
      {
        "verse_number": 1,
        "sanskrit": "...",
        "english": {
          "translation": "...",
          "commentary": "..."
        },
        "turkish": {
          "translation": "...",
          "commentary": "..."
        }
      }
    ]
  }
}
```
