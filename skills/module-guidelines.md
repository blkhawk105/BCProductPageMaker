# Module Guidelines

Universal rules for the music product module. Every skill reads this file before acting. These rules do not need to be repeated in individual skills — a reference to this file is sufficient.

## Dependencies

Read before acting:

- `registry/user-preferences.md` (always — store name and unit preference)

---

## Web Navigation — Tool Priority

**Always use the Chrome DevTools MCP (browser navigation tool) to open web pages. Do not use curl, WebFetch, or any non-browser fetch tool.**

Parked domains, expired domains, and JavaScript-rendered catalogs all return plausible-looking HTML to a fetch tool while showing nothing useful in a real browser. Browser navigation is the only reliable verification method.

If Chrome DevTools MCP is not available, use whatever browser automation tool is available. If no browser tool exists in this environment, say so before proceeding — do not silently fall back to curl.

---

## Output Format

All outputs from this module are plain markdown (`.md`) files. Never write HTML, Svelte, Vue, React, or any frontend component or template code — regardless of how the request is phrased. "Product page" always means CMS-ready markdown content for BigCommerce, not a web page implementation.

---

## Directory Creation

When creating output directories, always use:

```bash
mkdir -p "output/[Brand]/[Model]/[SKU]/images"
```

- Always quote the path — brand and model names often contain spaces
- The `-p` flag creates all intermediate directories and does not error if the folder already exists
- Create the images subfolder at the same time as the parent folder when running product-image-search

---

## User Preferences

Read `registry/user-preferences.md` at the start of every task. Apply values silently:

- `store_name` — used in SEO title tags, meta descriptions, and any output that references the store
- `include_own_store` — controls whether Ted Brown Music appears in AIMM searches
- `units` — controls measurement units in spec output

If the file exists but a field is blank, ask the user for that value before proceeding and write it back to the file.

---

## Excluded Retailers

The following must **never** be used as sources for any product content — images, descriptions, specifications, pricing, or any other data intended for our catalog or marketing:

- Sweetwater
- Guitar Center
- Music & Arts
- Sam Ash
- Any national chain retailer not on the AIMM store locator

**One exception:** These retailers _may_ be consulted for **discontinued product verification only** (see below). This is a narrow, read-only exception — never use them as a source for any content we will publish.

---

## Product Identity Verification

**Before extracting any content from any page, confirm the page is for the exact product requested — not a product family, category, or similar item.**

### Before checking anything — confirm the page is fully loaded

If the snapshot does not clearly show a product name and the requested SKU or model number together, reload the page and take a second snapshot before proceeding. Do not attempt extraction from a partial or unclear snapshot.

### What to check

Both of the following must be true before extracting any content:

1. **SKU / model number match** — the model number, part number, or SKU shown on the page matches the one requested (e.g., `P02218` must appear on the page, not just `Slinky` or `Regular Slinky`)
2. **Product name match** — the product name or description on the page is consistent with what the user asked for (e.g., if the user said "John Mayer signature strings," the page must describe a John Mayer signature product — not a standard or unrelated set)

If the SKU matches but the product name does not, stop immediately and report it:

> ⚠️ SKU conflict — `[SKU]` appears on this page but the product is described as "[page product name]", not "[user-provided name]". This may be a recycled or reassigned SKU. Do not use this content. How would you like to proceed?

**[STOP — wait for user guidance before extracting anything]**

SKU recycling is common in the music industry — manufacturers frequently reuse part numbers when a product is discontinued and renumbered. A SKU match alone is not sufficient confirmation.

### Red flags — do not extract from this page

- The page title or H1 describes a product line or category ("Slinky Electric Strings," "Acoustic Guitar Strings")
- No specific model number or part number is visible on the page
- The specs or description appear to cover a range of products ("available in multiple gauges," "choose your set")
- The URL contains `/strings/`, `/guitars/`, or another category path with no product-specific segment
- The SKU matches but the product name on the page does not match what the user requested

### What to do if the page doesn't match

1. Look for a more specific link on the current page — product listing pages often link to individual SKU pages
2. Try a targeted search: `site:[brand-url] [model-number]` or `"[exact model name]" site:[brand-url]`
3. Try navigating directly: `[brand-url]/products/[model-number]` or similar patterns from the brand registry
4. If no dedicated product page can be found, note it explicitly:
   > ⚠️ No dedicated product page found for [Brand] [Model] [SKU]. Content sourced from: [describe what was found]. Verify accuracy before publishing.

**Never use content from a page that hasn't been confirmed as the specific product.** A wrong page produces wrong specs, wrong copy, and wrong custom fields — and the errors are not obvious.

---

## Legacy SKU Detection

During any page read or spec extraction, watch for indicators that the requested SKU is retired or renumbered. Stop immediately if any of the following appear:

- The SKU is labeled "(Legacy)", "(Old SKU)", "(Discontinued SKU)", or similar
- The page or spec table shows "Replaced by [different SKU]", "Now available as [SKU]", or "Current SKU: [different SKU]"
- Two SKUs are listed for the same product where the requested one is the older entry (e.g., `P02218 (Legacy) / P02221 (Current)`)
- The page redirects to a different product URL than expected

When any of these are found, stop before extracting any content and report:

> ⚠️ Legacy SKU — `[requested SKU]` appears to be a retired or replaced identifier. The current SKU is listed as `[current SKU]`.
> Please confirm before I continue:
>
> 1. Build the page for the legacy SKU `[requested SKU]` as requested
> 2. Switch to the current SKU `[current SKU]`
> 3. This is a different product that reused this SKU — provide the correct product name

**[STOP — do not extract specs, copy, or images until the user confirms which product to build]**

This applies even if the product line is the same brand and category. A renumbered SKU may have different specs, different gauges, or be an entirely different product sharing the same number after the original was retired.

---

## Pricing — Never Include

**Never mention price, cost, or value in any output — copy, specs, custom fields, SEO, or alt text.** This applies unconditionally: no MSRP, no street price, no MAP, no "affordable," no "budget-friendly," no "premium price point," no any other direct or implied reference to what the product costs.

This rule also covers: star ratings, review counts, inventory status ("in stock," "3 left"), and any other data that changes with transactions. None of it belongs in product content.

Pricing changes constantly and is managed separately in the CMS. Any price written into product content will be wrong the moment it changes.

---

## Source Principles

These apply to all content types. Per-skill rules add specifics on top.

- **Manufacturer-controlled sources and AIMM member stores are the only permitted content sources.** Never use aggregator sites, image search engines, stock sites, fan sites, review sites, or unauthorized redistributors.
- **Manufacturer press kits and media asset pages are explicitly permitted** — they exist for exactly this purpose.
- **When in doubt about a source's authorization, skip it and note the uncertainty.** Do not assume permission; confirm it.
- Copyright rules are non-negotiable and cannot be overridden by user requests, urgency, or any other justification.

---

## Discontinued Product Handling

This policy applies any time a product's active status is uncertain, regardless of which skill is running. **Check for discontinuation during the first manufacturer website visit in any skill** — typically Step 1 of product-specs, product-image-search, or product-copy. If discontinuation is detected at that point, stop the current step, report it per Step 3 below, and wait for the user before continuing.

### Step 1 — Check the manufacturer website first

The manufacturer is always the source of truth for discontinuation.

- If the product page explicitly states it is discontinued → flag immediately, no further verification needed.
- If the product page is simply missing (404, not found in catalog) → proceed to Step 2.

### Step 2 — Multi-source verification for unlisted products

If the product cannot be found on the manufacturer's site at all, verify discontinuation using at least **2 independent sources** before flagging.

Acceptable verification sources (for this purpose only — not for content):

- Major retailers (Guitar Center, Sweetwater, etc.)
- Music industry news sites and press
- Community forums (Gear Page, TalkBass, Harmony Central, Reddit r/guitar)
- Second-hand marketplaces that list original production dates

### Step 3 — Report clearly

> ⚠️ **[Brand] [Model] appears to be discontinued.**
> Confirmed via: [list sources used]
> Note: [any relevant context — last known year, successor model if known, etc.]
> Content found may be from archived pages — verify usage rights before publishing.

### What to do after flagging

- Do not stop the task — continue to find whatever content is available and present it with the discontinuation warning attached
- The user may still need images/copy/specs for catalog maintenance, comparisons, or historical records
- Let the user decide whether to proceed with the flagged content
