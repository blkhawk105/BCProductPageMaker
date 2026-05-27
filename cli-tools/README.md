# cli-tools

Standalone Node utilities for working with BigCommerce product images. These scripts run outside the main app and have no build step — just `node <script>`.

## Scripts

### `prepareImageExport.mjs`

Reads a BigCommerce product export CSV and outputs a download-ready CSV with human-readable filenames.

```
node cli-tools/prepareImageExport.mjs <input.csv> <output.csv>
```

**Input columns:** `Item`, `ID`, `Name`, `SKU`, `Options`, `Variant Image URL`, `Internal Image URL (Export)`

**Output columns:** `ID`, `URL`, `export_image_name`

Naming convention:

- **Variant images** — `{kebab-product-name}_{value1}_{value2}.{ext}` (all option values joined by `_`)
- **Internal images** — `{kebab-product-name}_{imageID}.{ext}`

Feed the output into `downloadImages.mjs`.

---

### `downloadImages.mjs`

Downloads images from a CSV, saving each file under its `export_image_name`.

```
node cli-tools/downloadImages.mjs <input.csv> <output-dir/> [--workers N]
```

**Input columns:** `ID`, `URL`, `export_image_name`

BigCommerce CDN URLs are automatically normalized to the largest available size tier (1280×1280) before downloading. Default concurrency: 5 workers.

---

### `checkSquareImages.mjs`

Checks whether images at a list of URLs are square, and records their dimensions and type.

```
node cli-tools/checkSquareImages.mjs <input.csv> <output.csv> [--workers N]
```

**Input columns:** `ID`, `URL`

**Output columns:** adds `isSquare` (`TRUE`/`FALSE`/`error: ...`), `imageType`, `width`, `height`

Fetches only enough bytes to detect dimensions — aborts the stream early once width and height are known. Default concurrency: 10 workers.

---

## Typical workflow

```sh
# 1. Export products from BigCommerce admin as CSV

# 2. Generate the download manifest
node cli-tools/prepareImageExport.mjs export.csv export-named.csv

# 3. Download all images
node cli-tools/downloadImages.mjs export-named.csv ./images/

# 4. Optionally verify images are square before uploading
node cli-tools/checkSquareImages.mjs export-named.csv export-checked.csv
```

## Shared utilities (`utils.mjs`)

Internal module imported by the scripts above — not meant to be called directly.

| Export                                                         | Description                                                                         |
| -------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `normalizeBcCdnUrl(url)`                                       | Swaps the BC CDN size segment to `.1280.1280` (largest pre-generated tier)          |
| `processWithConcurrency(items, fn, concurrency, reportEvery?)` | Runs `fn` over `items` with a capped concurrency pool, reporting progress to stdout |

## Tests

```sh
pnpm test:unit --project cli-tools
```
