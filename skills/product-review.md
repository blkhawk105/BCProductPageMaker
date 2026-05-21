# Product Review Skill

Audits a completed (or in-progress) product build against the project's quality standards. Produces a structured review with pass/fail checks, issue classifications, and a prioritized action list. Does not rewrite any output — review only.

## Dependencies

Read before acting:
- `registry/user-preferences.md` (always)
- `skills/module-guidelines.md` (universal rules)
- `reference/Custom_Fields_Product_Filters.md` (needed for Step 2 category check)

---

## Required Inputs

- **Brand**: Manufacturer name (e.g., `Zildjian`)
- **Model**: Product model name (e.g., `New Beat HiHats`)
- **SKU**: Part number or `Standard` if none specified (e.g., `A0133`)

All content to review is read from `output/[Brand]/[Model]/[SKU]/`. Do not visit any manufacturer or retailer website — this skill reads disk files only.

---

## Step 0 — Determine Build Status

List every file and folder present in `output/[Brand]/[Model]/[SKU]/`. Map what exists to the steps that produced it:

| Files present | Steps complete |
|---|---|
| `product-features.md` only | Step 1 |
| `+ product-bc-custom-fields.md` | Steps 1–2 |
| `+ images/` folder | Steps 1–3 |
| `+ product-description.md` (no `## SEO` heading) | Steps 1–4 |
| `+ product-description.md` (has `## SEO` heading) | Steps 1–5 |
| `+ product-description.md` (has `## Image Alt Text` heading) | Steps 1–6, build complete |

Report this as the first section of the review output. If the build is incomplete, continue reviewing whatever steps are present — do not stop at the first missing file.

Also flag any files present that are **not** in the expected list above. Extra files (e.g., `README.md`, `product-images.md`, `P02218-alt.txt`) are a compliance issue — list them by name.

---

## Step 1 — Review `product-features.md`

Read the file. Run every check. Report each as ✅ (pass) / ⚠️ (warning — data gap or content quality) / ❌ (fail — compliance):

### Prohibited Fields — ❌ if present

These must never appear as rows in the spec table or anywhere in this file:

| Field type | Examples to watch for |
|---|---|
| Pricing | `MSRP`, `Price`, `Street Price`, `MAP`, `Cost` |
| Ratings / reviews | `Rating`, `Reviews`, `Stars`, `Review Count` |
| Availability | `Stock`, `Inventory`, `In Stock`, `Ships in` |
| Bad extraction | Any spec key that is not a real English product attribute — misspelled words, OCR artifacts, page navigation fragments (e.g., `Plank`, `Add to Cart`, `Ships From`) |

For bad extractions, report the exact key name in the issue.

### Completeness — ⚠️ if missing

- **Identifier**: At least one of MPN, EAN, UPC, or ASIN must be present
- **Shipping dimensions**: Must be present — if estimated, confirm an explicit estimate flag/note is in the file; if absent entirely, flag as missing
- **Shipping weight**: Same rule as dimensions

### Quality — ⚠️ if failing

- **Feature bullets**: 3–5 bullets present. Fewer than 3 is thin; more than 5 starts to pad.
- **Grounded bullets**: Each bullet must be traceable to a spec row in the table. Bullets that make claims not supported by any spec entry are fabrication risks — flag them with the specific claim.
- **Source citation**: A sourcing line ("`Specs sourced from: ...`") must appear at the bottom of the file

---

## Step 2 — Review `product-bc-custom-fields.md`

### If the file is absent

Check `reference/Custom_Fields_Product_Filters.md` for the product's category (read from `product-features.md`):
- If the category **is** listed in the reference file → the missing custom fields file is a **compliance** issue; flag it ❌
- If the category is **not** listed → the absence is expected behavior (the custom fields STOP gate should have fired and the step was intentionally skipped); note it as expected and move on

### If the file is present

Run these checks:

- **Unresolved fields with no action**: Any ⚠️ row in the file must have a specific action note (e.g., "check zildjian.com product page"). Flag ⚠️ rows that say only "unresolved" with no guidance.
- **Inferred values**: Values derived from naming convention rather than a confirmed spec (e.g., finish inferred from absence of "Brilliant" in the name) must have an explicit confirmation note. Flag any inferred value without one.
- **Paired product weight entries**: For any product with top/bottom or multi-component weight variants (e.g., hi-hat pair), Weight must appear as two separate rows. Flag if asymmetric weights are condensed into a single entry.

---

## Step 3 — Review `images/`

### Compliance — ❌ if found

- Any `.md` file in the images folder (e.g., `README.md`, `sources.md`)
- Any file with spaces in the filename
- Any file with special characters in the filename (parentheses, commas, ampersands, etc.)
- Duplicate filenames

### Naming convention — ⚠️ if failing

Each filename should follow `[model-slug]-[angle-descriptor]-[background].ext`. Flag any file that doesn't follow this pattern by listing the offending filename.

### Coverage — ⚠️ if failing

- Folder is empty or has 0 image files: flag as missing
- Minimum useful coverage is 1 image; flag if only 1 with a note to add more

### Cross-SKU images — note only

If images in the folder belong to related but distinct SKUs (e.g., top/bottom individual variants used for a pair listing), note it as informational — it is not an error. Confirm that the alt text correctly identifies which component each image shows.

---

## Step 4 — Review `product-description.md` Body Copy

Read the body copy section (everything before the `## SEO` heading, if present).

### Compliance — ❌ if found

- A `## Specifications` heading, or any reproduction of the spec table from `product-features.md` inside the copy
- Any dollar amount, price, or cost reference in the prose
- Any image URL (`https://...`) or image table embedded in the copy body
- Any star rating or review count in the prose

### Copy length and structure — ⚠️ if failing

First, classify the product as **simple** or **complex**:

| Simple | Complex |
|--------|---------|
| Single-function accessories | Instruments |
| Strings, picks, straps, bags | Multi-component systems |
| Stands, clamps, mounts, cases | Electronics with multiple features |
| Consumables | Amplifiers, interfaces, mixers |

Then check paragraph and section counts against the limit for the classification:

| Product type | Max paragraphs | Max h2 sections |
|---|---|---|
| Simple | 3 | 3 |
| Complex | 6 | 5 |

Flag if either limit is exceeded, naming the product type used for the classification.

### Sourcing — ⚠️ if missing

- Manufacturer source URL must appear at the bottom of the copy section in the format: `*Copy based on manufacturer description: [URL]*`
- If any flags were carried forward from Steps 1 or 2 (e.g., unconfirmed finish, out-of-stock notice), a `## Flags` section must be present

---

## Step 5 — Review SEO Block

If no `## SEO` heading is found in `product-description.md`, mark Step 5 as not started and skip this section entirely.

If the heading is present, run these checks. Each is a pass/fail with the specific value reported:

| Check | Pass condition | How to verify |
|---|---|---|
| Product Name / H1 | Present | Look for a line labeled "Product Name" or "H1" |
| Title tag | Present and ≤ 60 characters | Count characters exactly; report the count |
| Meta description | Present and ≤ 160 characters | Count characters exactly; report the count |
| On-site search keywords | Present as a list | Look for a keywords section |
| Keyword audit table | Present with Keyword / Confidence / Status columns | Check column headers |
| Copy changes section | Present | Documents what body copy edits were made and why |

For the title tag and meta description, always report the actual character count even when passing — this lets the reviewer spot values close to the limit.

---

## Step 6 — Review Alt Text Table

If no `## Image Alt Text` heading is found in `product-description.md`, mark Step 6 as not started and skip this section entirely.

If the heading is present:

**Coverage — ❌ if failing:**
- Every file in `images/` must have a corresponding row in the alt text table
- List any image file that has no alt text entry by filename

**Quality — ⚠️ if failing:**
- Each alt text entry should be at least 80 characters — flag any entry shorter than this
- Each entry should describe: what the subject is, the angle or view, any visible branding, and the background — flag entries that omit more than one of these elements

---

## Issue Classification

Every issue reported must be tagged with exactly one label:

| Label | Meaning | Publishing impact |
|---|---|---|
| **Compliance** | Prohibited content is present, or required content format was violated | Must fix before publishing |
| **Data gap** | Information is missing or unconfirmed — not a model error, needs external lookup | Verify before publishing |
| **Content quality** | Copy or structure doesn't meet guidelines — may be acceptable depending on context | Review before publishing |

---

## Output Format

```
# Product Review — [Brand] [Model] [SKU]
*Reviewed: [date]*

## Build Status
[Step completion table]
[Extra/unexpected files, if any]

## Step 1 — product-features.md
**Quality: [Good / Good with issues / Needs rework]**
[Check results — ✅ ⚠️ ❌ per item]
[Issues list if any, each tagged with classification label]

## Step 2 — product-bc-custom-fields.md
[same structure]

## Step 3 — images/
[same structure]

## Step 4 — Body Copy
[same structure]

## Step 5 — SEO
[same structure — or "Not started" if section absent]

## Step 6 — Alt Text
[same structure — or "Not started" if section absent]

## Outstanding Items Before Publishing
| Item | Classification | Priority | Action |
|------|---------------|----------|--------|
[Compliance issues first (High), Data gaps second (Medium), Content quality last (Low)]
```

Use "Good" when all checks pass. Use "Good with issues" when only ⚠️ items are present. Use "Needs rework" when any ❌ items are present.

---

## Save Output

After the review is written, save it to:

```
output/[Brand]/[Model]/[SKU]/product-review.md
```

This file is informational only — it does not feed any subsequent build step and is not required for the build to be complete.

---

## Signal Complete

After `product-review.md` is written, end the session with:

> "✅ product-review complete — output written to `output/[Brand]/[Model]/[SKU]/product-review.md`.
>
> Review any ❌ compliance issues before publishing. ⚠️ data gaps require external verification. Content quality items are judgment calls."

---

## Edge Cases

| Situation | Action |
|---|---|
| Build not started (no files in SKU folder) | Report the folder as empty, note all steps are pending, and stop — nothing to review |
| Only `product-features.md` present | Review Step 1 only; note all remaining steps as not started |
| `product-bc-custom-fields.md` absent but category not in reference file | Note as expected behavior — not an error |
| Images folder exists but is empty | Flag as a Step 3 compliance issue — folder present but no images downloaded |
| `product-description.md` has SEO block but no alt text table | Steps 4–5 complete, Step 6 not started |
| Extra files in SKU root (not in runbook spec) | List in Build Status section; classify as compliance if they are non-markdown binary files or frontend code; note as minor if they are informational markdown |
| Product is a bundle or kit | For copy length classification, treat as complex |
