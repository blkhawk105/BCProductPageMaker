# Product Custom Fields Skill

Populates BigCommerce custom fields used for faceted search and category filtering. Field definitions live in a reference document that this skill reads at runtime. This keeps field definitions maintainable without editing this skill.

> ⚠️ **Stop before writing any output:** If the product's category is not found in `reference/Custom_Fields_Product_Filters.md`, do **not** create `product-bc-custom-fields.md`. Do not write any file at all. Stop and ask the user how to proceed.

## Dependencies
Read before acting:
- `registry/user-preferences.md` (always)
- `skills/module-guidelines.md` (universal rules)
- `reference/Custom_Fields_Product_Filters.md` (field definitions — read at runtime, every time)

---

## Required Inputs
- **Brand**: Manufacturer name
- **Model**: Product model name/number
- **SKU / Variant** *(recommended)*: Specific finish, color, or configuration
- **Spec table**: Read from `output/[Brand]/[Model]/[SKU]/product-features.md` — this file is written by `skills/product-specs.md` and must exist before this skill runs
- **Product category**: The BigCommerce category this product will be listed under (e.g., "Saxophones", "Electric Guitars", "Headphones")

If the product category is not provided, infer it from the product type and confirm with the user before proceeding:
> "I'll be looking up custom fields under [inferred category]. Does that sound right?"

**[STOP — wait for category confirmation if inferred, not explicitly provided]**

---

## Step 1 — Read the Reference Document

Open `reference/Custom_Fields_Product_Filters.md`. Do not rely on memory of its contents — the document is updated independently and may have changed.

If the document cannot be found:
> "I can't find Custom_Fields_Product_Filters.md in the reference directory. Please confirm the file location before I continue."

**[STOP — wait for user guidance if file not found]**

Locate the section matching the product's category. Extract the full custom field table for that category — field names, required values (enum options), example values, and notes. Note any General Guidelines at the top of the document — these apply to all categories.

If the product category is not found in the document:
> "No custom field definitions found for '[category]' in Custom_Fields_Product_Filters.md. This category may not have fields defined yet, or the category name may not match. Known categories include: [list top-level categories from the document]. How would you like to proceed?"

**[STOP — wait for user guidance if category not found]**

---

## Step 2 — Resolve Each Field Value

Work through every field in the category's table.

### Enum fields (fixed option list)
- Match the correct option exactly as written in the document — case, spacing, and punctuation must match exactly
- Source from the spec table first, then manufacturer page if needed
- If multiple options apply (e.g., MIDI I/O supports In, Out, and USB), list all that apply as separate values — see Multi-Value Fields below

### Open fields (Required Value column shows `---`)
- Pull the value directly from the spec table
- Apply any formatting rules from the Notes column (e.g., bore size: no leading zero before decimal; wattage: lowercase w; bell size: round to nearest 1/8")
- Use units from the Notes column — these fields have their own formatting requirements independent of the unit preference in user-preferences.md

### Conditional fields (Notes column says "Delete this if..." or "If No, do not include")
- Only include the field if the condition is met
- If the condition cannot be determined from available sources, flag it:
  > ⚠️ [Field Name] — could not confirm whether condition applies. Manual review needed.

### Fields that cannot be resolved
- Do not guess or approximate
- Mark as unresolved in the output:
  > `[Field Name]: UNRESOLVED — [brief reason]`
- Continue to the next field

---

## Step 3 — Apply General Formatting Rules

After resolving all values, apply the General Guidelines from the document to the full output. Current standing rules (verify against document — these may have been updated):

- **Flat symbols**: Use lowercase `b` — never emoji, unicode ♭, or any other character. Applies to any field containing a key or pitch value (e.g., `Bb`, `Eb`, not `B♭`).
- **Bore sizes**: No leading zero before the decimal (`.445"` not `0.445"`).
- **Wattage**: Always lowercase `w` (e.g., `50w` not `50W`).
- **Numeric fields**: Use numerals, not words (e.g., `6` not `six`).
- **Bell sizes**: Round to nearest 1/8"; always include hyphen between whole number and fraction (e.g., `12-1/8"` not `12 1/8"`).

If the document's General Guidelines section has been updated with additional rules, apply those as well.

---

## Multi-Value Fields

BigCommerce custom fields are key-value pairs — one value per field entry. Handle multi-value fields by creating one entry per value:

```
MIDI I/O: In
MIDI I/O: Out
MIDI I/O: USB
```

Do not combine multiple values into a single entry.

---

## Step 4 — Output Format

Present the resolved custom fields as a clean two-column table, ready to enter into BigCommerce:

| Custom Field Name | Value |
|-------------------|-------|
| Type | Tenor Sax |
| Level | Professional |
| Finish | Gold Lacquer |
| Instrument Key | Bb |
| Body Material | Yellow Brass |

Follow the table with:

```
Custom Fields Summary
✅ Resolved: [N] fields
⚠️  Unresolved: [N] fields — manual review needed (listed below)
📋 Category: [category name]
📄 Reference: Custom_Fields_Product_Filters.md (read [date])
```

List each unresolved field with the reason:
```
Unresolved fields:
• [Field Name] — [reason]
```

---

## Save Output

After the custom fields run is complete, write the resolved field table and summary to:

```
output/[Brand]/[Model]/[SKU]/product-bc-custom-fields.md
```

Create the folder path if it does not already exist.

---

## Signal Complete

After `product-bc-custom-fields.md` is written, end the session with:

> "✅ product-custom-fields complete — output written to `output/[Brand]/[Model]/[SKU]/product-bc-custom-fields.md`.
>
> **Full build — Step 3 is next: product-image-search**
> End this session, then continue with:
> *"Run product-image-search for [Brand] [Model] [SKU]"*"

---

## Sourcing Rules

- **Spec table is the primary source** for all field values
- **Manufacturer product page** is the secondary source
- **Do not use retailer descriptions** — they may use non-standard terminology
- **Never invent a value** — an honest unresolved is better than a wrong value in the filter system

---

## Standalone Use

This skill can run independently:
- To populate custom fields when specs are already available
- To audit or update custom fields on an existing listing
- To check what fields are required before beginning research

When run standalone, check whether `output/[Brand]/[Model]/[SKU]/product-features.md` exists and read it from disk. If it does not exist, stop:
> "`product-features.md` not found — run product-specs first, then come back to this step."

**[STOP — do not proceed without the spec file]**

---

## Edge Cases

| Situation | Action |
|-----------|--------|
| Category exists in document but table is empty or marked placeholder | Flag: "Custom fields for [category] appear to be defined but incomplete in the reference document." Continue with whatever fields are present. |
| Product spans two categories (e.g., hybrid uke) | Ask user which category to use; note the other in flags |
| Product is a bundle/kit | Use the primary (most featured or highest-value) component's category for custom fields. Flag which component's category was used and note that bundle-level fields may not exist in the reference document. |
| Field value in spec uses different terminology than document options | Map to closest matching option; note the mapping in flags for review |
| Spec table has conflicting values for a field | Do not use either value; flag as unresolved with both values listed |
| Document has a note saying a field is being deprecated or updated | Flag it and apply current document value |
| Running on a simple product (strap, pick, cable) | Check if the category has any custom fields defined; many accessories do not. Report clearly if none apply. |
