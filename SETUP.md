# Book Translation App Setup & Usage Guide

## Prerequisites

1.  **Node.js**: Ensure Node.js v22 or later is installed (`node -v`).
2.  **Environment Variables**:
    Create a `.env` file in the project root to store your API keys:
    ```env
    OPENAI_API_KEY=sk-...
    DEEPL_API_KEY=...
    # Optional: APP_DB_PATH=data/my-db.sqlite
    ```

## Installation

1.  Clone the repository.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Build the project:
    ```bash
    npm run build
    ```

## Database Setup

The application uses a local SQLite database.

1.  **Migrate**: Initialize the database schema.
    ```bash
    node dist/cli/index.js db migrate
    ```
    This creates the necessary tables in `data/book-translations.sqlite` (or path specified by `APP_DB_PATH`).

2.  **Seed**: Populate default data.
    ```bash
    node dist/cli/index.js db seed
    ```
    This seeds the following prompt templates:
    *   `default`: A simple prompt for basic verse generation.
    *   `Sanskrit-Scripture-Translation`: A specialized prompt for Bhagavad Gita style scriptures (Sanskrit/English/Turkish).

## Usage Workflow

All commands support `--json` for machine-readable output.

### 1. Store a Book Structure

Define your book's structure (title, chapters, verse counts) in a JSON file.

*Example `book.json`:*
```json
{
  "slug": "my-book",
  "title": "My Great Book",
  "author": "Me",
  "chapters": [
    { "number": 1, "expected_verse_count": 10 },
    { "number": 2, "expected_verse_count": 15 }
  ]
}
```

**Command:**
```bash
node dist/cli/index.js book store --file book.json
```

### 2. Generate Chapter Content

Generate verses for a chapter using an AI provider.

**Option A: Simple Generation**
```bash
node dist/cli/index.js chapter generate \
  --book "Bhagavad Gita" \
  --chapter 7 \
  --expected-verses 30 \
  --template "default" \
  --provider ai-sdk
```

**Option B: Sanskrit Scripture Generation (Complex)**
```bash
node dist/cli/index.js chapter generate \
  --book "Bhagavad Gita" \
  --chapter 7 \
  --expected-verses 30 \
  --template "Sanskrit-Scripture-Translation" \
  --provider ai-sdk \
  --format sanskrit-scripture
```

*   `--template`: The name of the prompt template (e.g., "default", "Sanskrit-Scripture-Translation").
*   `--provider`: `ai-sdk` (OpenAI), `fake` (testing).
*   `--format`: Output format schema (`simple` [default], `sanskrit-scripture`).
*   `--resume`: Add this flag to continue a failed/interrupted run.

### 3. Translate Verses

Translate specific verses to a target language.

**Command:**
```bash
node dist/cli/index.js verse translate \
  --book "my-book" \
  --chapter 1 \
  --verses 1,2,3 \
  --to es \
  --provider deepl
```

*   `--to`: Target language code (e.g., `es`, `fr`, `de`).
*   `--provider`: `deepl`, `ai-sdk`, `fake`.

### 4. Retrieve Translations

Get stored translations for a specific verse.

**Command:**
```bash
node dist/cli/index.js translations get \
  --book "my-book" \
  --chapter 1 \
  --verse 1
```

## Adding Custom Templates

You can create your own prompt templates for chapter generation.

**Command:**
```bash
node dist/cli/index.js template add --name "custom-style" --file path/to/template.md
```

## Troubleshooting

*   **Database Locked**: Ensure no other process is holding a lock on the SQLite file.
*   **Provider Errors**: Check your `.env` file or environment variables for `OPENAI_API_KEY` or `DEEPL_API_KEY`.
*   **Missing Data**: Ensure you ran `db migrate` and `db seed`.
