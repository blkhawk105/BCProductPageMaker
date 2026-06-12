## Project Overview

**BCProductPageMaker** is a BigCommerce product content pipeline for Ted Brown Music. It automates writing product descriptions, custom fields, SEO, and copy for BC product pages.

The project has two layers:

1. **Markdown skill system** (active) — Claude Code skills in `skills/` drive the current workflow. Claude navigates the web, extracts content, and writes structured markdown files. `skills/runbook.md` is the router for all skill tasks.
2. **TypeScript CLI app** (in progress) — a standalone app that wraps the skills as Claude API system prompts and outputs a BC-importable diff CSV. See `temp-prj-notes/PLAN.md` for the full architecture.

---

## Read First

**Always read `skills/runbook.md` before doing any product/skill work.** It maps every task type to the correct skill file(s).

When the runbook or any skill says "end the current session and start a fresh one," run `/compact`.

---

## Toolchain

| Concern            | Tool                                                                               |
| ------------------ | ---------------------------------------------------------------------------------- |
| Language           | TypeScript                                                                         |
| Package manager    | pnpm                                                                               |
| Build / dev        | Vite+ (`viteplus.dev`) — unified CLI for runtime, build, lint, and test            |
| Linting            | **oxlint** via `pnpm vp lint` — do NOT use `pnpm eslint` (no ESLint config exists) |
| Testing            | Vitest (via Vite+)                                                                 |
| Formatting         | Prettier                                                                           |
| Browser automation | Playwright                                                                         |
| AI                 | Local LLM via Ollama or LM Studio (`fetch`-based, no external SDK)                 |
| CSV                | `csv-parse` + `csv-stringify`                                                      |
| CLI interaction    | `@inquirer/prompts`                                                                |

---

## Directory Structure

```
BCProductPageMaker/
├── src/
│   └── lib/
│       ├── pipeline/         # orchestrator + step functions (specs, customFields, copy, seo)
│       ├── csv/              # BC CSV parser, writer, schema/types
│       ├── api/              # Anthropic SDK wrapper + Playwright browser singleton
│       └── registry/         # brand-registry and user-preferences readers
├── scripts/
│   └── cli.ts                # CLI entry point
├── cli-tools/                # standalone Node utility scripts (outside main app)
│   └── checkSquareImages.mjs # checks BC product images for size/square via CDN
├── skills/                   # skill markdown files — UNCHANGED, used as Claude API system prompts
├── registry/                 # brand-registry.md, user-preferences.md, aimm-members.md
├── reference/                # Custom_Fields_Product_Filters.md and other reference docs
├── output/                   # intermediate markdown files and bc-import CSVs written here
└── temp-prj-notes/           # planning docs (PLAN.md has full architecture)
```

---

## BigCommerce CDN

Product image URLs follow this pattern:

```
https://cdn11.bigcommerce.com/s-{store}/products/{pid}/images/{iid}/{filename}.{timestamp}.{W}.{H}.{ext}?c=1
```

The `W.H` segment is a pre-generated size tier — the CDN does **not** resize dynamically for arbitrary values. This store (`s-10xdzq6qo9`) has two tiers:

- `.386.513` — thumbnail (default URL BC generates)
- `.1280.1280` — zoom / largest available

Anything above 1280 returns 404. Stripping the numbers entirely also 404s. To request the largest available image, replace the `.W.H` segment with `.1280.1280`.

---

## Output Location

All skill outputs go to `output/[Brand]/[Model]/[SKU]/`. CLI app outputs go to `output/bc-import-YYYY-MM-DD-HHmm.csv`. No path confirmation needed.

Output files from skills are always plain markdown (`.md`). Never write HTML or frontend components — "product page" here means CMS-ready content for BigCommerce, not a web page.
