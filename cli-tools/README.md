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

### `generateAltText.mjs`

Generates alt text for downloaded product images using a local Ollama or LM Studio vision model, writing results into the `Image Description` column of a BC import CSV.

```
node cli-tools/generateAltText.mjs <images.csv> <import.csv> <images-dir/> <output.csv> [flags]
```

**Positional arguments:**

| Argument      | Description                                                                        |
| ------------- | ---------------------------------------------------------------------------------- |
| `images.csv`  | Download manifest from `prepareImageExport.mjs` (`ID`, `URL`, `export_image_name`) |
| `import.csv`  | BC product export/import CSV — must include an `Image Description` column          |
| `images-dir/` | Directory containing the downloaded image files                                    |
| `output.csv`  | Destination for the updated BC import CSV (can be the same file as `import.csv`)   |

**Flags:**

| Flag                | Description                                                                                                             |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `--model <name>`    | Vision model name (default: `llava`)                                                                                    |
| `--resume`          | Skip image IDs already recorded in the progress sidecar — use this to pick up after a crash                             |
| `--progress <file>` | Path to the progress sidecar (default: `<output.csv>.progress.json`) — useful when the output path changed between runs |
| `--lm-studio`       | Use LM Studio's OpenAI-compatible API instead of Ollama                                                                 |
| `--host <url>`      | Override the backend host (default: `http://localhost:11434` for Ollama, `http://localhost:1234` for LM Studio)         |

**Common invocations:**

```sh
# Local Ollama (default)
node cli-tools/generateAltText.mjs images.csv import.csv ./images/ output.csv

# Local LM Studio
node cli-tools/generateAltText.mjs images.csv import.csv ./images/ output.csv --lm-studio

# LM Studio on another machine
node cli-tools/generateAltText.mjs images.csv import.csv ./images/ output.csv --lm-studio --host http://192.168.0.208:1234

# Resume a crashed run, pointing to an existing sidecar
node cli-tools/generateAltText.mjs images.csv import.csv ./images/ output.csv --resume --progress /path/to/old.progress.json

# Write results back into the same file used as input
node cli-tools/generateAltText.mjs images.csv import.csv ./images/ import.csv
```

Before processing starts, the script checks that every image in the manifest exists on disk. If any are missing it lists them and asks whether to continue. If you choose not to continue, you are given the option to save a `<output>.missing.csv` report of the missing files. This catches pointing at the wrong images directory before wasting any GPU time.

Images are processed one at a time. Chat history accumulates for up to 10 images then resets, keeping the context window small while maintaining stylistic consistency within each batch.

A progress sidecar is written after each successful image. Run with `--resume` to pick up after a crash; omit it to regenerate all alt text from scratch. Failed images are **not** marked done in the sidecar, so they will be retried automatically on `--resume`.

If any images fail (e.g. the backend dropped mid-run), a summary is printed at the end with the ID, filename, and error for each failure. You are then asked whether to save a `<output>.failures.csv` report — useful for tracking down which products need a second pass.

Errors are never written into the `Image Description` column — the output CSV is always import-safe.

Requires Ollama running locally (`ollama serve`) with a vision-capable model pulled (e.g. `ollama pull llava`), or LM Studio with its local server enabled.

---

## Typical workflow

```sh
# 1. Export products from BigCommerce admin as CSV

# 2. Generate the download manifest
node cli-tools/prepareImageExport.mjs export.csv export-named.csv

# 3. Download all images
node cli-tools/downloadImages.mjs export-named.csv ./images/

# 4. Generate alt text and write into BC import CSV
node cli-tools/generateAltText.mjs export-named.csv export.csv ./images/ import-with-alt.csv

# 5. Optionally verify images are square before uploading
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
