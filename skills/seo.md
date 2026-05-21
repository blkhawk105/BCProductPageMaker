# SEO Skill

Final-pass SEO optimization for product display pages. Runs after `skills/product-copy.md` and `skills/product-specs.md`. Does not generate content from scratch — it audits, researches, recommends, applies, and reports.

## Dependencies
Read before acting:
- `registry/user-preferences.md` (always — store name required for title tags and meta descriptions)
- `skills/module-guidelines.md` (universal rules)

---

## Required Inputs
- **Product copy** — read from `output/[Brand]/[Model]/[SKU]/product-description.md` (written by product-copy)
- **Spec table + features** — read from `output/[Brand]/[Model]/[SKU]/product-features.md` (written by product-specs)
- **Brand + Model + SKU** — for keyword research targeting
- **Store name** — from `registry/user-preferences.md` (`store_name`)
- **Current product name** *(optional)* — from CRM/POS, for comparison

If either disk file is missing, stop and tell the user which skill needs to run first. If store name is blank in user-preferences.md, ask for it before proceeding.

---

## Step 1 — Keyword Research

Research what players and shoppers actually search for around this product.

### Method
- Use web search as the primary source for keyword data — searches current trends and surfaces terms with real volume
- If web search returns nothing useful (new product, very niche category), fall back to knowledge-based research using product category, manufacturer, and use case
- Focus on **buyer-intent keywords** — terms someone uses when they're close to a purchase decision, not general educational queries

### What to look for
- The product model name in various formats (with and without hyphens, common misspellings, abbreviated versions)
- Category terms searchers use ("tenor saxophone," "Bb tenor sax," "pro tenor sax")
- Use-case terms ("bebop saxophone," "vintage-style tenor," "jazz tenor sax")
- Comparison terms if the product is frequently compared to others
- Brand + category combinations ("Eastman saxophone," "Eastman tenor")

### Output
Produce a ranked list of 5–10 candidate keywords with confidence levels:
- **High** — appears in multiple search contexts, clear buyer intent
- **Medium** — relevant but lower volume or more general
- **Low** — niche or speculative, worth including in on-site search but not prioritizing in copy

---

## Step 2 — Content Audit

Compare the keyword research against the copy and spec table in the two input files.

For each high and medium confidence keyword, note:
- ✅ Present — appears naturally in the copy
- ⚠️ Underrepresented — appears once or only in a non-prominent position
- ❌ Missing — not present anywhere in the copy

Do not flag low-confidence keywords as missing — they belong in the on-site search list but don't need to be forced into copy.

---

## Step 3 — Apply Improvements to Copy

For each missing or underrepresented high/medium keyword, make a specific surgical edit to the body copy in `product-description.md` where it fits naturally.

- **Never force a keyword** — if it can't be added without sounding unnatural, skip it and note why
- **Do not restructure copy** — word-level and phrase-level changes only
- **Prefer the opening paragraph** for primary keywords
- **Maintain the voice and tone already present in `product-description.md`**
- **Do not touch `product-features.md`** — feature bullets are not part of SEO's scope

Write the updated body copy back to `product-description.md`, replacing only the body copy section. Preserve all existing sections below it unchanged.

Track every change for the diff summary in the appended SEO block:

```
CHANGES MADE:
• Para 1: "professional Bb tenor saxophone" → "professional Bb tenor saxophone for jazz"

NO CHANGE (could not fit naturally):
• "bebop saxophone" — would require restructuring para 2; recommend manual review
```

---

## Step 4 — Generate Product Name (H1)

The product name is the page H1 and carries the most SEO weight of any element on the page. It should be accurate, scannable, and front-loaded with the terms shoppers actually search for.

### Formula
**`[Brand] [Model/SKU] [Meaningful Description] - [Qualifiers]`**

### Rules
- Lead with Brand, then Model or SKU (whichever is more recognizable to shoppers)
- Meaningful Description: what the product actually is, in plain language ("Tenor Saxophone," "Guitar Strap," "Instrument Microphone")
- Qualifiers: finish, size, color, key feature — only include what meaningfully differentiates this SKU. Use a dash to separate qualifiers.
- Use title case throughout
- Do not include store name
- Keep it scannable — shoppers should understand the product from the name alone
- Incorporate the primary high-confidence keyword naturally if the formula allows

### Examples
- `Eastman ETS852 52nd Street Tenor Saxophone - Unlacquered`
- `Shure BETA56A Supercardioid Swivel-Mount Instrument Microphone`
- `Levy's 2-Inch Signature Tri-Glide Series Leather and Suede Guitar Strap - Red`
- `Ahead S-Hoop Carbon Fiber Marching Practice Pad with Snare Sound - 14-Inch - Black`

The recommended name is output in the SEO block for the user to review. The user decides which to use — copy the output into BigCommerce. No approval gate is needed here.

---

## Step 5 — Write Title Tag

### Formula
`[Brand] [Model] [Key Differentiator] | [Store Name]`

### Rules
- **Target: 50–60 characters** — Google displays ~60 before truncating
- Lead with the most searchable terms — brand and model first, store name last
- Include the store name from `registry/user-preferences.md` at the end, separated by ` | `
- If the combined title exceeds 60 characters, store it as-is and flag what Google will likely display:
  > ⚠️ Title tag is 68 characters. Google will likely display:
  > "Zildjian Z Custom Chroma 5A Gold Drumsticks | Ted Br..."
  > Full title stored: "Zildjian Z Custom Chroma 5A Gold Drumsticks | Ted Brown Music Company"

---

## Step 6 — Write Meta Description

### Rules
- **Target: 150–160 characters**
- Customer-facing — written to be read by a person in search results, not a crawler
- Include the primary keyword naturally in the first sentence
- Describe what the product is and who it's for in plain language
- End with a soft, natural call to action using the store name from `registry/user-preferences.md`
- Do not copy from the product copy — write fresh for the search snippet context
- Do not include price — it changes and the meta description is cached

### Example
> *"The Eastman ETS852 is a professional Bb tenor saxophone with vintage-inspired tone, the DS mechanism, and two included necks. Shop the 52nd Street at Ted Brown Music Company."*
> (160 characters)

---

## Step 7 — Build On-Site Search Keyword List

Produce a comma-separated list for the CMS "Search Keywords" field.

### What to include
- Model name variants (with/without hyphens, common abbreviations)
- Category terms at multiple levels of specificity
- Brand name alone and combined with category
- Use-case and genre terms where applicable
- Finish, color, or variant descriptors for this specific SKU

### What to exclude
- Competitor brand names
- Generic terms so broad they'd match everything ("saxophone," "instrument")
- Misspellings — handled by search engine fuzzy matching

**Length guidance:** 8–15 terms, no hard limit.

**Format** (comma-separated, ready to paste into CMS):
```
Eastman ETS852, 52nd Street tenor sax, professional tenor saxophone,
unlacquered tenor saxophone, jazz tenor saxophone, Eastman tenor sax
```

---

## Save Output

SEO makes two writes to `product-description.md`:

**1. In-place body copy update** — the body copy section is edited directly with the keyword improvements from Step 3. This is the authoritative version of the copy going forward. All content below the body copy (source note, flags, any prior appended blocks) is left unchanged.

**2. Appended SEO block** — added at the bottom of the file after all existing content:

```markdown
---

## SEO — [YYYY-MM-DD]

### Copy Changes
[diff summary from Step 3]

### Product Name (H1)
[recommended name]

### Title Tag
[title tag text — N characters]

### Meta Description
[meta description text — N characters]

### On-Site Search Keywords
[comma-separated list]

### Keyword Audit
[which high/medium keywords are now present, which are still missing]
```

If `product-description.md` does not yet exist, stop — product-copy must run first.

**Idempotency**: If `product-description.md` already contains a `## SEO —` block from a previous run, replace that block in place rather than appending a second one. Only the SEO block is replaced — all other content (body copy, source note, flags, alt text table) is preserved.

---

## Signal Complete

After appending the SEO block to `product-description.md`, end the session with:

> "✅ seo complete — SEO summary appended to `output/[Brand]/[Model]/[SKU]/product-description.md`.
>
> **Full build — Step 6 is next: product-alt-text**
> End this session, then continue with:
> *"Run product-alt-text for [Brand] [Model] [SKU]"*"

---

## Edge Cases

| Situation | Action |
|-----------|--------|
| No existing copy — `product-description.md` missing | Stop. Tell the user product-copy must run first. |
| Product is new with no search data | Fall back to knowledge-based keyword research; flag lower confidence |
| Store name not in preferences | Ask for it before proceeding; write it to `registry/user-preferences.md` |
| Title tag cannot fit under 70 characters | Present best option with flag; do not truncate in a way that loses meaning |
| Keyword fits but was flagged in spec conflict | Do not use the conflicting value — treat as unavailable |
| Alt texts needed | Alt text is handled by `skills/product-alt-text.md` — run it after SEO |
