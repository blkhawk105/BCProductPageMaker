# Product Specs Skill

Finds, structures, and normalizes product specifications for the music instrument and pro audio industry. Output is always confirmed key-value pairs — no estimates, no guesses. If a value cannot be confirmed, it is flagged as not found.

## Dependencies
Read before acting:
- `registry/user-preferences.md` (always)
- `registry/brand-registry.md` (for manufacturer URL lookup)
- `skills/module-guidelines.md` (universal rules)

---

## Required Inputs
- **Brand**: Manufacturer name
- **Model**: Product model name/number
- **SKU / Variant** *(recommended)*: Specific finish, color, or configuration
- **Copy** *(optional)*: Product description text — used as a spec extraction source if structured specs are unavailable

> ⚠️ **The brand, model, and SKU from the user's request are the ground truth for the entire session. Do not modify or "correct" them based on search results.** If a search returns a page for a different product, the search failed — not the product name. Report the failure and try a different search query. Never continue with modified product details.

---

## Simple Product Detection

Before searching for specs, assess whether the product is likely to need a full spec list.

### What counts as "simple"
Products where the primary value to the shopper is non-technical — straps, picks, cables, cleaning kits, basic stands, capos, string sets, etc. These products rarely have manufacturer spec pages and shoppers don't typically need detailed spec tables.

### Detection and prompt
If the product appears simple:
> "This looks like it might not need a full spec list — most shoppers won't need detailed specs for a [product type]. I'll still look for shipping dimensions and UPC. Would you like me to build a full spec list too?"

Wait for the user's answer. Then offer to remember it:
> "Would you like me to remember this for all [product type] going forward?"

Note the preference in the session for use in future tasks of this type.

**Regardless of the answer**, always search for shipping dimensions — these are required for all products.

If the user says no to a full spec list, write `product-features.md` with just the shipping dimensions and any easily available identifiers (MPN, EAN). Downstream skills (product-custom-fields, product-copy) can still run with this minimal file — they will adapt to whatever content is present.

---

## Spec Search Strategy

### Step 1 — Manufacturer website (primary)
1. Check `registry/brand-registry.md` for the brand's US market URL
2. If the brand is not in the registry, search the web for `[Brand] official site` or `[Brand] musical instruments`. After successfully navigating their product page, propose adding the brand to `registry/brand-registry.md` before continuing — wait for user approval, then write the entry.
3. Navigate to the product page for the specific model/SKU
4. **Verify product identity before extracting anything** — confirm the page is the dedicated page for this exact model/SKU per the Product Identity Verification rules in `skills/module-guidelines.md`. If the page is a family or category page, navigate to the specific product page before continuing.
5. Look for a specifications table, accordion, or tab — usually labeled "Specs," "Specifications," "Technical Details," or similar
6. Extract all available key-value pairs
7. If no structured spec section exists, proceed to Step 2

### Step 2 — Extract from provided copy
If copy text has been provided and no structured specs were found:
- Extract only explicitly stated factual details (dimensions, materials, counts, model numbers, certifications)
- Convert sentence form to key-value form: *"The body is made of poplar"* → `Body Material: Poplar`
- Do not infer, interpret, or expand — only convert what is directly stated
- Flag extracted-from-copy specs with source: `[extracted from copy]`

### Step 3 — Retailer and third-party sources
Specs listed as key-value pairs are not copyright protected. Any source is acceptable as long as the correct product can be guaranteed.

**Identity verification is critical.** Before using any spec from a third-party source, confirm the product match on at least these points:
- Brand name (exact)
- Model name/number (exact)
- SKU / variant / finish if applicable

If there is any ambiguity — wrong category, suspiciously different specs, product names that could apply to non-music items (straps, cases, stands, etc.) — do not use that source. Flag the ambiguity and note it in the output.

Useful third-party sources: Amazon, B&H, retailer product pages, manufacturer spec sheets/PDFs, distributor catalogs.

### Step 4 — No specs found
If no structured specs can be found from any source:
> "No structured specifications found for [Brand] [Model] from any confirmed source. If you have a spec sheet or product manual, I can extract from that."

---

## Spec Output Format

### Grouping
Group specs into logical sections. Use only the sections that apply — do not create empty sections.

| Section | Typical contents |
|---------|-----------------|
| **General** | Product type, color/finish, handedness, country of origin |
| **Construction** | Body material, neck material, fingerboard, hardware finish |
| **Electronics** | Pickup type/model, controls, output, battery, connectivity |
| **Dimensions** | Scale length, body dimensions, overall length, weight |
| **Compatibility** | Compatible accessories, required hardware, app/software |
| **Certifications** | Safety ratings, compliance marks |
| **Shipping** | Box dimensions, shipping weight *(see Shipping Specs section)* |
| **Identifiers** | MPN, EAN — *UPC is handled by `skills/product-upc.md`* |

### Key-value formatting
Present specs as a clean two-column table:

| Spec | Value |
|------|-------|
| Body Material | Poplar |
| Neck Material | Roasted Maple |
| Pickups | 2× JB-Style Single Coil |
| Scale Length | 34 in (864 mm) |

- Keys: title case, concise, consistent
- Values: use confirmed units from source; normalize to the unit preference in `registry/user-preferences.md`
- Never leave a value blank — if unknown, omit the row entirely and flag it separately

### Unit normalization
Apply the unit preference from `registry/user-preferences.md` (`us` / `metric` / `both`). Default is US if not set.

- US: inches, pounds, ounces, feet
- Metric: mm/cm, kg, g
- Both: show as `34 in (864 mm)` / `8.2 lb (3.7 kg)`

### Source tracking
For every spec row, silently record the source URL and date retrieved. Do not display in the main output. Note at the bottom if specs were drawn from multiple sources:
> "Specs sourced from: [list of domains used]"

---

## Shipping Dimensions

Required for all products regardless of spec list depth. Used for realtime shipping rate calculation at checkout.

### Source priority
1. Manufacturer product page (look for "shipping dimensions," "box dimensions," "package dimensions")
2. Retailer listings — Amazon, B&H, and similar are acceptable for this data
3. Distributor spec sheets

### If shipping dimensions are unavailable
Draw a bounding box around the product in its **packaged/shipped state**:

- For rigid products: physical dimensions plus standard packing allowance (~1 in / 2.5 cm per side)
- For flexible, rollable, or foldable products (straps, cables, fabric goods): estimate dimensions in their natural packaged state — rolled or folded as they would realistically ship, **not** fully extended
- For bundle/kit SKUs: use the assembled shipping box dimensions, not individual component sizes

Report estimated bounding box dimensions clearly as estimates:
> "Shipping dimensions not found — estimated bounding box: 12 × 4 × 2 in. Recommend confirming with a physical unit before use in production."

Do not guess at weight — if shipping weight is unavailable, flag it:
> "Shipping weight not found. Recommend weighing a physical unit."

---

## Bundle / Kit Detection

If the SKU appears to be a bundle or kit:
- Flag it explicitly before proceeding:
  > "This appears to be a bundle/kit SKU — [reason]. Should I look up specs for the bundle as a whole, or individual components, or both?"
- Wait for confirmation before proceeding
- Shipping dimensions for a bundle should reflect the complete assembled shipping box

---

## Output Summary

At the end of every spec run:

```
✅ Specs found: [N keys across N sections]
✅ Shipping dimensions: [found / estimated — confirm before production use]
⚠️  [Any flags]
Sources: [list of domains consulted]
```

---

## Feature Bullets

After the spec table is complete, write 3–8 feature bullets summarizing the product's key selling points. Bullets are grounded in confirmed specs — do not write from assumption.

**Rules:**
- Each bullet must state a feature and why it matters. "Poplar body" is not a bullet. "Poplar body keeps the instrument lightweight without sacrificing tonal depth" is.
- Minimum 3 bullets. If 3 meaningful bullets cannot be written, omit the section and note it.
- Maximum 8 bullets.
- Do not include values already obvious from the spec table (exact dimensions, UPC, etc.)
- Write in the same plain, confident prose as the store voice — no adjective stacking

---

## Save Output

After the spec table and feature bullets are complete, write both to:

```
output/[Brand]/[Model]/[SKU]/product-features.md
```

Structure the file as:

```markdown
# [Brand] [Model] [SKU] — Specs & Features

## Specifications
[spec table]

## Feature Bullets
[bullet list]
```

Create the folder path if it does not already exist.

---

## Signal Complete

After `product-features.md` is written, end the session with:

> "✅ product-specs complete — output written to `output/[Brand]/[Model]/[SKU]/product-features.md`.
>
> **Full build — Step 2 is next: product-custom-fields**
> End this session, then continue with:
> *"Run product-custom-fields for [Brand] [Model] [SKU]"*"

---

## Edge Cases

| Situation | Action |
|-----------|--------|
| Spec page in another language | Translate values; note original language in sources |
| Conflicting values across sources | Report the conflict; list both values with sources; do not pick one |
| Product is a software/plugin | Adapt sections — system requirements replace physical specs |
| Spec listed as a range (e.g., "7–8 lb") | Report the range as-is; do not average |
| Measurement listed without units | Flag it; do not assume units |
| Product identity ambiguous (wrong category risk) | Flag and do not use that source |
