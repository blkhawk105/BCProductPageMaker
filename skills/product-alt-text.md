# Product Alt Text Skill

Writes accessible alt text for downloaded product images. Runs after `skills/seo.md`. Loads each image from disk, writes medium-length descriptive alt text for each, and appends a reference table to `product-description.md`.

## Dependencies

Read before acting:

- `registry/user-preferences.md` (always)
- `skills/module-guidelines.md` (universal rules)

---

## Required Inputs

- **Brand, Model, SKU** — to locate the correct image folder
- **Images** — must exist in `output/[Brand]/[Model]/[SKU]/images/`

If the images folder is empty or does not exist, stop:

> "No images found in `output/[Brand]/[Model]/[SKU]/images/`. Run product-image-search first."

---

## Process

For each image file in `output/[Brand]/[Model]/[SKU]/images/`:

1. Load and view the image
2. Write alt text according to the rules below

### Alt Text Rules

- Describe what is actually visible — do not describe what you expect to see based on the product name
- Include: brand name, model name/number, key visual details (angle, finish, background, any notable feature visible in this specific shot)
- **Target length: 100–175 characters** — enough to be meaningful to a screen reader user, not so long it becomes a sentence fragment list
- Do not start with "Image of," "Photo of," or "Picture of" — begin with the subject directly
- Do not use marketing language ("stunning," "beautiful," "premium")
- For lifestyle shots: describe the product in its context, not just the context itself
- For detail shots: name the specific part or feature shown

### Examples

| Type      | Alt Text                                                                                           |
| --------- | -------------------------------------------------------------------------------------------------- |
| Hero shot | `Yamaha YAS-26 alto saxophone in gold lacquer finish, full front view on white background`         |
| Detail    | `YAS-26 keywork detail showing left hand stack, G-sharp lever, and thumb hook`                     |
| Lifestyle | `Shure SM58 dynamic microphone on a boom stand in a live concert setting, performer in background` |
| Angle     | `Eastman ETS852 tenor saxophone, rear three-quarter view showing unlacquered brass bell and bow`   |

---

## Save Output

Append the following table to the bottom of `product-description.md`, after all existing content including the SEO block. **If a `## Image Alt Text` block already exists from a previous run, replace it in place rather than appending a second table.**

```
output/[Brand]/[Model]/[SKU]/product-description.md
```

```markdown
---

## Image Alt Text — [YYYY-MM-DD]

| File Name                         | Alt Text                                                                                 |
| --------------------------------- | ---------------------------------------------------------------------------------------- |
| yas26-full-front-white-bg.jpg     | Yamaha YAS-26 alto saxophone in gold lacquer finish, full front view on white background |
| yas26-keywork-left-hand-stack.jpg | YAS-26 keywork detail showing left hand stack, G-sharp lever, and thumb hook             |
```

---

## Signal Complete

After the table is appended, end the session with:

> "✅ product-alt-text complete — alt text table appended to `output/[Brand]/[Model]/[SKU]/product-description.md`.
>
> **Full build complete.** All output files are in `output/[Brand]/[Model]/[SKU]/`. No further steps remain."

---

## Edge Cases

| Situation                                                           | Action                                                                                  |
| ------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Image won't load or is corrupted                                    | Skip it; note the filename in the table with: `[could not load — manual review needed]` |
| Image shows multiple products (bundle/kit)                          | Describe all visible items, leading with the primary product                            |
| Lifestyle shot with no product clearly visible                      | Flag it: alt text should note the product is not clearly featured                       |
| Two very similar images (e.g., same angle, slightly different crop) | Write distinct alt text for each — note the difference explicitly                       |
| File name is not descriptive                                        | Write the alt text from what you see; do not rely on the filename                       |
