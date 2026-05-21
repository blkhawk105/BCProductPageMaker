# Product UPC Skill

**Only run this skill when the user explicitly requests a UPC lookup. Do not run it automatically as part of any build sequence or because specs are complete.**

Looks up and verifies UPC codes for music products. Must be invoked on its own by explicit user request. Does not depend on specs or copy output.

## Dependencies
Read before acting:
- `registry/user-preferences.md` (always)
- `skills/module-guidelines.md` (universal rules)

---

## Required Inputs
- **Brand**: Manufacturer name
- **Model**: Product model name/number
- **SKU / Variant** *(recommended)*: Specific finish, color, or configuration — UPCs are variant-specific

---

## Source Priority

1. **Manufacturer product page** — most reliable; if found here, no cross-referencing needed
2. **Manufacturer barcode/product data sheets or distributor catalogs**
3. **UPC databases and retail listings** — acceptable only with cross-reference verification (see below)

---

## Variant UPC Rules

- Different color/finish variants of the same model **almost always have different UPC codes** — never assume shared UPCs across variants without explicit confirmation
- In rare cases variants may share a UPC — before reporting this, confirm with at least **3 independent sources** that explicitly list the same UPC for both variants

---

## Cross-Reference Verification

If the UPC is not found on the manufacturer's website, it must be confirmed by at least **3 independent sources** before reporting.

Acceptable cross-reference sources: UPCitemdb, Barcodelookup, Amazon ASIN/UPC lookup, retail product listings that display barcode data, distributor spec sheets.

---

## If UPC Cannot Be Confirmed

> "UPC not confirmed for [Brand] [Model] [variant]. [N] source(s) checked — insufficient cross-references for confident reporting. Recommend requesting directly from your vendor or distributor."

---

## Save Output

After the UPC lookup is complete, write the result to:

```
output/[Brand]/[Model]/[SKU]/product-upc.md
```

Create the folder path if it does not already exist.

---

## Signal Complete

After `product-upc.md` is written, end the session with:

> "✅ product-upc complete — output written to `output/[Brand]/[Model]/[SKU]/product-upc.md`. End this session before starting the next step."

---

## Output

```
UPC: [value] — confirmed via [source]
```
or
```
UPC: not confirmed — [N] source(s) checked. Recommend requesting from vendor.
```
