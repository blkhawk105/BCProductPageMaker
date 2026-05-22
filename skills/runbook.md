# Runbook — Task Router

Read this file first. It maps every incoming task to the skill(s) and registry files to load. Do not load any skill or registry file that is not listed for the current task.

---

## Web Navigation — Tool Priority

**Always use the Chrome DevTools MCP (browser navigation tool) to open web pages. Do not use curl, WebFetch, or any non-browser fetch tool.** This applies to every task — specs, images, copy, registry lookups, and anything else that requires visiting a URL.

Parked domains and JavaScript-rendered pages look valid to a fetch tool but fail in a real browser. If Chrome DevTools MCP is not available, use whatever browser automation tool is available. If no browser tool exists at all, say so explicitly before proceeding.

**At the start of every session that requires web navigation, open a fresh browser tab first using the `new_page` tool before navigating to any URL.** An existing tab may be in a broken, captcha-blocked, or stale state from a previous session. A new tab guarantees a clean starting point.

---

## Task → Skill Mapping

| User Request            | Load Skill                                    | Also Read                                                |
| ----------------------- | --------------------------------------------- | -------------------------------------------------------- |
| "get specs for X"       | `skills/product-specs.md`                     | `registry/brand-registry.md`                             |
| "get UPC for X"         | `skills/product-upc.md`                       | _(none)_                                                 |
| "find images for X"     | `skills/product-image-search.md`              | `registry/brand-registry.md`, `registry/aimm-members.md` |
| "write copy for X"      | `skills/product-copy.md`                      | `registry/brand-registry.md`                             |
| "custom fields for X"   | `skills/product-custom-fields.md`             | `reference/Custom_Fields_Product_Filters.md`             |
| "SEO for X"             | `skills/seo.md`                               | _(none — seo reads from disk files)_                     |
| "write alt text for X"  | `skills/product-alt-text.md`                  | _(none)_                                                 |
| "build full page for X" | Run skills in sequence (see Full Build below) | As needed per skill                                      |
| "review output for X"   | `skills/product-review.md`                    | _(reads all output files in SKU folder)_                 |
| "add a brand"           | Edit `registry/brand-registry.md` directly    | _(none)_                                                 |
| "update AIMM stores"    | Edit `registry/aimm-members.md` directly      | _(none)_                                                 |
| "update my preferences" | Edit `registry/user-preferences.md` directly  | _(none)_                                                 |

Every skill reads `skills/module-guidelines.md` on startup — it loads `registry/user-preferences.md` and defines universal source rules, excluded retailers, and discontinued product handling. This is not listed in the Also Read column because it is implicit for all skills.

Always read `registry/user-preferences.md` before any task that produces output — it contains the store name and unit preference.

---

## Full Build Sequence

For "build full page for X," run skills in this order. Each step writes its output to disk, then the session ends before the next step begins. The next step starts with a completely fresh context and reads everything it needs from disk — nothing depends on conversation memory. This separation is what makes each skill independently re-runnable.

```
Step 1:   product-specs
          reads:  registry/brand-registry.md
          writes: output/[Brand]/[Model]/[SKU]/product-features.md
          → end session

Step 2:   product-custom-fields
          reads:  output/[Brand]/[Model]/[SKU]/product-features.md
                  reference/Custom_Fields_Product_Filters.md
          writes: output/[Brand]/[Model]/[SKU]/product-bc-custom-fields.md
          → end session

Step 3:   product-image-search
          reads:  registry/brand-registry.md, registry/aimm-members.md
          writes: output/[Brand]/[Model]/[SKU]/images/
          → end session

Step 4:   product-copy
          reads:  output/[Brand]/[Model]/[SKU]/product-features.md
                  registry/brand-registry.md
          writes: output/[Brand]/[Model]/[SKU]/product-description.md
          → end session

Step 5:   seo
          reads:  output/[Brand]/[Model]/[SKU]/product-description.md
                  output/[Brand]/[Model]/[SKU]/product-features.md
          writes: updates body copy in product-description.md in place
                  appends SEO block (title, meta, changes summary) to product-description.md
          → end session

Step 6:   product-alt-text
          reads:  output/[Brand]/[Model]/[SKU]/images/ (each image file)
          writes: appends alt text table to product-description.md
          → end session
```

---

## Continuing a Full Build

Each step ends with a Signal Complete message that names the next step and gives an exact resume phrase. After the session ends:

1. Start a new session
2. Say the resume phrase from the Signal Complete message — e.g., _"Run product-custom-fields for Ernie Ball P02218 Standard"_
3. The runbook maps that phrase to the correct skill; the skill reads all its inputs from disk

**You never need to re-explain the product.** The Brand, Model, and SKU are enough — all spec and copy data lives in the output folder.

If you are resuming a build and are unsure which step is next, check what files exist in `output/[Brand]/[Model]/[SKU]/`:

| Files present                                 | Next step                      |
| --------------------------------------------- | ------------------------------ |
| _(nothing)_                                   | Step 1 — product-specs         |
| `product-features.md` only                    | Step 2 — product-custom-fields |
| `product-bc-custom-fields.md`                 | Step 3 — product-image-search  |
| `images/` folder                              | Step 4 — product-copy          |
| `product-description.md` (no SEO block)       | Step 5 — seo                   |
| `product-description.md` (has `## SEO` block) | Step 6 — product-alt-text      |
| All files + alt text table                    | Build complete                 |

---

## UPC — Explicit Request Only

**NEVER run `skills/product-upc.md` automatically.** Do not include it in any build sequence. Do not run it when specs are complete. Do not run it unless the user explicitly asks for a UPC lookup in their message.

Trigger phrase: the user must say something like "get the UPC," "look up the UPC," or "run UPC" for this product. Proximity to a product name or SKU is not sufficient — the request must be explicit.

---

## Phase Gates (Full Build)

These gates occur within the skill step that triggers them and pause the build sequence there. Do not continue to the next step while a gate is open — wait for the user's response before proceeding.

| Gate                  | Triggered by                   | Behavior                                                                                                   |
| --------------------- | ------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| Preferences check     | Any skill (first run)          | Ask for store name, include-own-store, units. Skip if `registry/user-preferences.md` is already populated. |
| Simple product prompt | product-specs (Step 1)         | Ask whether to build a full spec list. Always search for shipping dimensions regardless of the answer.     |
| Category confirmation | product-custom-fields (Step 2) | If category is inferred, not provided — confirm before proceeding.                                         |
| Image selection       | product-image-search (Step 3)  | Present image table; ask which images to download.                                                         |
| Discontinued product  | Any skill                      | If discontinuation is confirmed, report it and ask whether to continue before proceeding with that step.   |

---

## Output Location

All skill outputs save automatically to `output/[Brand]/[Model]/[SKU]/`. No path confirmation is needed.

**Output files are always plain markdown (`.md`) files. Never write HTML, Svelte, Vue, React, or any other frontend component or template code.** "Product page" in this module means CMS-ready content files for BigCommerce — not a web page implementation. If a request sounds like it could mean either, assume markdown files.

**Re-running a step is always safe.** If an output file already exists from a partial or interrupted run, the skill overwrites or replaces the relevant section. There is no special recovery needed — just re-run the step from the beginning.

**If no SKU is specified**, use `Standard` as the SKU-level folder (e.g., `output/Yamaha/YAS-26/Standard/`). Apply this consistently across all skills in the same build.

| File / Folder                 | Written by                            | Notes                                                                                                     |
| ----------------------------- | ------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `images/`                     | product-image-search                  | Downloaded images go here                                                                                 |
| `product-description.md`      | product-copy → seo → product-alt-text | copy writes it; SEO updates body copy in place and appends title/meta block; alt-text appends image table |
| `product-features.md`         | product-specs                         | Spec table + feature bullets                                                                              |
| `product-bc-custom-fields.md` | product-custom-fields                 | Ready to paste into BigCommerce                                                                           |
| `product-upc.md`              | product-upc                           | Written only on explicit user request — never automatic                                                   |
| `product-review.md`           | product-review                        | Informational only; does not feed any build step                                                          |

---

## Registry Updates

After any confirmed brand interaction, propose adding or updating the entry in `registry/brand-registry.md`. Wait for user approval before writing.

If a brand is not in the registry, skills fall back to web search for the manufacturer URL. The Registry Updates step ensures any successfully resolved brand gets added for future runs.

After a full AIMM store search, update `registry/aimm-members.md` if new stores were found or any store returned errors.
