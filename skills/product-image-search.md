# Product Image Search Skill

Finds, evaluates, and retrieves product images for the music instrument and pro audio industry. Covers the full product line: band/orchestra instruments, guitars, bass, drums, keyboards, pro audio, DJ equipment, stage lighting, recording gear, accessories.

## Dependencies
Read before acting:
- `registry/user-preferences.md` (always)
- `registry/brand-registry.md` (manufacturer URL lookup and CDN patterns)
- `registry/aimm-members.md` (AIMM fallback — read only if reaching Step 3)
- `skills/module-guidelines.md` (universal rules)

---

## Required Inputs
- **Brand**: Manufacturer name (e.g., "Yamaha", "Shure", "Chauvet")
- **Model**: Product model name/number (e.g., "YAS-26", "SM58", "Intimidator Spot 260")
- **SKU / Variant** *(optional but recommended)*: Specific finish, color, bundle variant

If inputs are ambiguous or incomplete, ask for clarification before searching.

---

## Permitted Sources — Read Before Searching

Images may **only** be downloaded from:
1. Manufacturer-controlled websites and CDNs (Steps 1–2 below)
2. AIMM member stores listed in `registry/aimm-members.md` (Step 3 below)

**Any other source is off-limits — including retailers found in search results, international dealers, and marketplaces — regardless of image quality or availability.** If no image can be found from a permitted source, report that and stop. Do not download from an unpermitted source.

---

## Search Strategy (in order)

### Step 1 — Manufacturer Website (Primary / Source of Truth)
1. Check `registry/brand-registry.md` for the brand's US market URL and CDN patterns
2. If the brand is not in the registry, search the web for `[Brand] official site` or `[Brand] musical instruments`. After successfully navigating their product page, propose adding the brand to `registry/brand-registry.md` before continuing — wait for user approval, then write the entry.
3. Navigate to the product page for the specific model/SKU
4. **Verify product identity before using any image.** Two paths:
   - **CDN URL contains the model number or SKU** (e.g., `P02218` in the URL) — this is sufficient verification. The SKU in the URL confirms the image is for the correct product regardless of what page it was found on.
   - **CDN URL does not contain a product identifier** — apply the full Product Identity Verification rules from `skills/module-guidelines.md` to confirm the page itself is for the correct product before extracting image URLs.
5. If multiple variants exist, find the one matching the requested SKU/finish/color
6. Extract all images from the product gallery or carousel (see Image Standards below)
5. Apply CDN stripping rules from the brand registry to get full-resolution URLs
6. If a qualifying product page exists but has no suitable images, note this and continue to Step 2

**Always target the US market site first.** If the product is not found on the US site, try the brand's global or home-country site before moving to Step 2.

### Step 2 — Other Manufacturer-Controlled Sources
If the product page lacks suitable images:
- Check the manufacturer's press/media kit or assets page (often at `[brand].com/media`, `/press`, `/assets`, or `/resources`)
- Check the manufacturer's official social media only if high-resolution images are clearly available for download
- All sources in Step 2 must still be manufacturer-controlled — no third-party redistribution

### Step 3 — AIMM Member Stores (Fallback)
If manufacturer sources yield no usable images:

1. Read `registry/aimm-members.md`
2. Check whether the AIMM member list has been populated (if the table shows only the placeholder row, note it and offer to fetch the list first)
3. Search stores in `Search Order` ascending (lower numbers first)
4. Apply the per-store search process from `registry/aimm-members.md`
5. Apply the user's own-store preference from `registry/user-preferences.md` — include or exclude Ted Brown Music accordingly
6. Return images found from the first store that yields usable results

### Step 4 — No Images Found
If all steps fail:
> "No suitable images found for [Brand] [Model] from manufacturer or AIMM sources. Manual photography may be required."

---

## Image Standards

### Preferred (in order)
1. Clean product shot on pure white background — ideal for product pages
2. Clean shot on near-white / neutral background — background can be removed in Photoshop
3. Lifestyle/context image — product clearly featured, well-lit
4. Press/promotional image — acceptable if above options unavailable

### Resolution
- **Minimum acceptable:** 800×800px
- **Preferred:** 1280×1280px or larger
- Discard anything below 800px on either dimension

### Cropped / Detail Images
- Acceptable and desirable when they highlight specific product areas (keywork, controls, connectors, finish detail, etc.)
- Every set **must include at least one hero image** showing the full product — flag if none is available

### Watermarks
- Disqualify any image carrying a watermark of any kind
- Legitimate manufacturer product images do not use watermarks
- If only watermarked images are available, treat as "no usable images found" and escalate

### Other Disqualifiers
- Screenshots or scans
- Visually distorted or color-inaccurate images

### File Formats
Accepted: JPG, JPEG, PNG, TIFF, WebP, PSD
Not accepted: GIF (unless it contains a usable static frame), SVG

---

## Discontinued Product Handling

Follow the policy in `skills/module-guidelines.md` → **Discontinued Product Handling**. Continue searching for images and present them with the discontinuation warning attached.

---

## Output Format

Present results as a three-column markdown table before any downloads occur:

| ID | Description | URL |
|----|-------------|-----|
| 1 | Full product shot, white background | https://... |
| 2 | Keywork detail, left hand stack | https://... |

Description is a brief internal note for selection purposes only — not the final alt text. Alt text is written by `skills/product-alt-text.md` after images are downloaded.

### File Naming
Name downloaded files descriptively so the alt text skill and any human reviewer can identify each image without opening it.

Do not create README.md, index files, or any supplementary documentation inside the images folder — downloaded image files only.

- `[model]-[angle-or-subject]-[background].jpg` — e.g. `yas26-full-front-white-bg.jpg`
- `[model]-[detail-subject].jpg` — e.g. `yas26-keywork-left-hand-stack.jpg`
- Use lowercase, hyphens only, no spaces

---

## Approval and Download Workflow

### Gate 1 — Image Selection
Present the table and ask:
> "Which images would you like to download? You can say 'all', or list IDs like '1, 3, 5'. Say 'none' to skip downloading for now."

**[STOP — wait for user response before continuing]**

If the user says 'none' or 'skip': record image URLs and alt texts for the entry sheet, note that download is pending, and proceed without downloading.

### Gate 2 — Download
After image selection is confirmed, download the selected images to:

**Download path:**
`output/[Brand]/[Model]/[SKU]/images/[descriptive-name].[ext]`

Examples:
- `output/Yamaha/YAS-26/Gold-Lacquer/images/yas26-full-product-white-bg.jpg`
- `output/Shure/SM58/Standard/images/sm58-angle-view-grille-detail.jpg`

**Folder handling:** Use existing folders if they already exist — never create duplicates or versioned folders. If a file with the same name already exists, ask the user before overwriting.

**Always download using the Bash tool with curl — never use write_file or any other method to save binary image data:**

For each selected image, run:
```bash
curl -L "[image_url]" -o "output/[Brand]/[Model]/[SKU]/images/[filename.ext]"
```

---

## Signal Complete

After images are downloaded (or skipped), end the session with:

> "✅ product-image-search complete — images saved to `output/[Brand]/[Model]/[SKU]/images/`.
>
> **Full build — Step 4 is next: product-copy**
> End this session, then continue with:
> *"Run product-copy for [Brand] [Model] [SKU]"*"

---

## Copyright Compliance

General principles are in `skills/module-guidelines.md`. Image-specific rules:

- Only download images from manufacturer-controlled pages or AIMM member store pages — not from any other source even if the image appears there
- Never use images from aggregator sites, image search engines (Google Images, Bing Images), stock photo sites, or fan/review sites
- Watermarked images are disqualified regardless of source

---

## Edge Cases

| Situation | Action |
|-----------|--------|
| Brand website not found | Search `[Brand] [Model] official site`, or ask user for the URL |
| Product exists but no images on manufacturer page | Note in output; proceed to Step 2 then 3 |
| Multiple colorways/variants found | List all; confirm with user which to include |
| Product is a bundle/kit | Search for a hero image showing the full kit together. Also include individual component images if available. Note in the description column which items are shown in each image. |
| Product page behind a login or paywall | Skip; note in output |
| Images require JavaScript to load (lazy load) | Scroll/interact to trigger load; extract after render |
| Manufacturer website is in another language | Proceed; product images are universal |
| Image carousel requires interaction | Click through all slides to capture every image |
| AIMM member list is not yet populated | Offer to fetch and populate `registry/aimm-members.md` before searching |
| AIMM store URL returns 404 or connection error | Skip that store; note the store name and error in output; continue to the next store in Search Order |
