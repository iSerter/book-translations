import { Command } from "commander";
import { applyMigrations } from "../../db/migrate.js";
import { upsertPromptTemplate } from "../../db/repositories/prompt_templates.js";
import { printResult } from "../../lib/output.js";
import { openDatabase } from "../../db/connection.js";
import { buildContext, wrapAction } from "../run.js";

export function registerDbCommands(program: Command) {
  const dbCmd = program.command("db").description("Database management commands");

  dbCmd
    .command("migrate")
    .description("Run pending migrations")
    .action(wrapAction(program, async () => {
      const { config, outputMode } = buildContext(program);
      const db = openDatabase(config.dbPath);
      
      const applied = applyMigrations(db);
      
      printResult({ success: true, appliedCount: applied.length, appliedVersions: applied }, outputMode);
    }));

  dbCmd
    .command("seed")
    .description("Seed database with default data")
    .action(wrapAction(program, async () => {
      const { config, outputMode } = buildContext(program);
      const db = openDatabase(config.dbPath);

      const defaultTemplate = `You are a helpful assistant translating a book.
Book: {{bookTitle}}
Chapter: {{chapterNumber}}

Please generate verses {{startVerse}} to {{endVerse}} ({{count}} verses total).
Return the result as a JSON object with a "verses" array.
Each item should have "number" (integer) and "text" (string).`;

      const sanskritScriptureTemplate = `You are an expert Sanskrit scholar and translator specializing in {{bookTitle}}. Your task is to translate {{bookTitle}} Chapter {{chapterNumber}} with absolute completeness and accuracy.

Please generate verses {{startVerse}} to {{endVerse}} ({{count}} verses total).

## Core Requirements

1. **Completeness**: You MUST translate EVERY requested verse ({{startVerse}} to {{endVerse}}).
2. **Accuracy**: Provide faithful translations that preserve the philosophical and spiritual meaning.

## Output Format (JSON)

` + "```json" + `
{
  "chapter": {
    "verses": [
      {
        "verse_number": {{startVerse}},
        "sanskrit": "<Original Sanskrit text in Devanagari>",
        "english": {
          "translation": "<English translation>",
          "commentary": "<Brief explanation of key concepts, context, or significance>"
        },
        "turkish": {
          "translation": "<Turkish translation>",
          "commentary": "<Anahtar kavramlar, bağlam veya öneme dair kısa açıklama>"
        }
      }
    ]
  }
}
` + "```" + `

## Translation Guidelines

### English Translation
- Use clear, dignified modern English
- Preserve theological and philosophical precision
- Maintain poetic quality where possible without sacrificing clarity
- Be consistent with terminology for key concepts (dharma, karma, yoga, etc.)

### Turkish Translation
- Use contemporary Turkish that is both accessible and respectful
- Preserve Sanskrit concepts with appropriate Turkish equivalents or explanations
- Consider Islamic-Turkish philosophical vocabulary where conceptually parallel
- Maintain formal register appropriate for sacred texts

### Commentary Requirements
- Explain key Sanskrit terms (dharma, atman, brahman, yoga, etc.)
- Provide historical or narrative context where relevant
- Clarify philosophical concepts for modern readers
- Keep concise (3-5 sentences maximum)
- Address different levels: literal meaning, philosophical significance, practical application

## Quality Checklist

Before submitting, verify:
- [ ] All verses numbered sequentially from {{startVerse}} to {{endVerse}}
- [ ] No gaps in verse numbering
- [ ] Sanskrit text included for each verse
- [ ] Both English AND Turkish translations present for every verse
- [ ] Commentaries provided in both languages
- [ ] JSON is properly formatted and valid
- [ ] No extra fields outside the schema

## Important Notes

- If you realize you're approaching length limits, prioritize completing the requested range.
- Never summarize or skip verses to fit within limits
- Quality over speed - accuracy is paramount
- Maintain reverence for the sacred text while ensuring accessibility`;

      const tmpl1 = upsertPromptTemplate(db, {
          name: "default",
          content: defaultTemplate
      });

      const tmpl2 = upsertPromptTemplate(db, {
          name: "Sanskrit-Scripture-Translation",
          content: sanskritScriptureTemplate
      });

      const dhammapadaPaliTemplate = `You are an expert scholar of the Pali Canon (Tipitaka), specifically the Dhammapada.

Your task is to generate the Pali text for {{bookTitle}} Chapter {{chapterNumber}}.

**CRITICAL**: Generate EXACTLY {{count}} verses, starting from verse {{startVerse}} and ending at verse {{endVerse}}.
Do NOT include any verses before {{startVerse}} or after {{endVerse}}.

## Format Requirements

Return a SINGLE JSON object matching this structure exactly:

` + "```json" + `
{
  "format": "pali-scripture",
  "book": {
    "slug": "dhammapada",
    "title": "Dhammapada",
    "chapters": [
      {
        "number": {{chapterNumber}},
        "title_pali": "<Pali Chapter Title in Roman script>",
        "verses": [
          {
            "number": {{startVerse}},
            "pali": "<Pali text in Roman script>"
          },
          ... (EXACTLY {{count}} verses total, numbered {{startVerse}} to {{endVerse}})
        ]
      }
    ]
  }
}
` + "```" + `

## Content Guidelines
- You MUST return EXACTLY {{count}} verses (from {{startVerse}} to {{endVerse}}).
- Use standard Romanized Pali (IAST or similar).
- Ensure diacritical marks are correct (ā, ī, ū, ṅ, ñ, ṭ, ḍ, ṇ, etc.).
- The text must be accurate to the Theravada tradition.
- Do not include English translations, only the Pali source text.
- Ensure "title_pali" is the correct Pali name for the chapter (e.g., "Yamaka Vagga").`;

      const tmpl3 = upsertPromptTemplate(db, {
          name: "dhammapada-pali",
          content: dhammapadaPaliTemplate
      });

      printResult({ success: true, seeded: { templates: [tmpl1.name, tmpl2.name, tmpl3.name] } }, outputMode);
    }));
}
