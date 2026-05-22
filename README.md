# ProductPageMaker

A TypeScript CLI that automates BigCommerce product page content using Claude AI. Accepts a BC product export CSV, runs a 6-step pipeline per selected product, and outputs a narrow diff CSV ready to drag-and-drop import back into BigCommerce.

## Stack

| Concern            | Choice                                                                 |
| ------------------ | ---------------------------------------------------------------------- |
| Toolchain          | [Vite+](https://viteplus.dev) — runtime, build, test, lint in one tool |
| Language           | TypeScript                                                             |
| AI                 | Anthropic SDK — `claude-sonnet-4-6`                                    |
| Browser automation | Playwright                                                             |
| CSV                | `csv-parse` + `csv-stringify`                                          |
| CLI interaction    | `@inquirer/prompts`                                                    |
| Testing            | Vitest                                                                 |
| Future web UI      | SvelteKit (additive — no existing code changes required)               |

## Setup

```sh
pnpm install
```

## Development

```sh
pnpm dev
```

## Testing

```sh
pnpm test          # unit + e2e
pnpm test:unit     # unit only
pnpm test:e2e      # playwright only
```

## CLI Usage

```sh
pnpm run build path/to/product-export.csv
```

Select one or more products from the interactive list. The pipeline runs each step in sequence and writes a `output/bc-import-YYYY-MM-DD-HHmm.csv` containing only the columns that were populated.

## Pipeline Steps

| Step              | What it does                                       | Output                              |
| ----------------- | -------------------------------------------------- | ----------------------------------- |
| 1 — Specs         | Extracts product features from manufacturer page   | `product-features.md`               |
| 2 — Custom Fields | Populates BC custom fields                         | `product-bc-custom-fields.md`       |
| 3 — Images        | Finds and downloads product images                 | `images/`                           |
| 4 — Copy          | Writes product description HTML                    | `product-description.md`            |
| 5 — SEO           | Adds page title, meta description, search keywords | updates `product-description.md`    |
| 6 — Alt Text      | Writes image alt text                              | appends to `product-description.md` |
