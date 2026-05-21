# Product Copy Skill

Writes PDP body copy and feature bullets for music instrument and pro audio products. Copy is grounded in confirmed specs, written in a consistent store voice, and designed to educate as much as it sells.

## Dependencies
Read before acting:
- `registry/user-preferences.md` (always)
- `registry/brand-registry.md` (manufacturer URL lookup)
- `skills/module-guidelines.md` (universal rules)

---

## Required Inputs
- **Brand**: Manufacturer name
- **Model**: Product model name/number
- **SKU / Variant** *(recommended)*: Specific finish, color, or configuration
- **Specs**: Read from `output/[Brand]/[Model]/[SKU]/product-features.md` — this file is written by `skills/product-specs.md` and must exist before this skill runs

If `product-features.md` does not exist, stop and ask the user to run product-specs first. Do not write copy from memory or assumption.

---

## Never Include in Copy Output

Regardless of what appears on source pages, these must **never** appear in `product-description.md`:

- Prices, MSRP, or any dollar amounts
- Stock status, inventory counts, or availability notices ("In stock," "3 left")
- Shipping thresholds, return windows, or store guarantees
- Customer reviews, star ratings, or "Customers Also Viewed" cross-sell sections
- Inline image embeds — no `![...](...)` syntax in copy
- Emojis in any heading
- Content sourced from a retailer page — see manufacturer-only rule in Step 1

---

## Step 1 — Research Manufacturer Copy

Before writing, find the manufacturer's own description of the product:

1. Check `registry/brand-registry.md` for the brand's US market URL
2. If the brand is not in the registry, search the web for `[Brand] official site` or `[Brand] musical instruments`. After successfully navigating their product page, propose adding the brand to `registry/brand-registry.md` before continuing — wait for user approval, then write the entry.
3. Navigate to the product page and locate any description, feature text, or marketing copy the manufacturer has written. **The source must be the manufacturer's own website — not a retailer, distributor, or the store's own site, even if those appear first in search results.**
4. **Verify product identity before reading any copy** — confirm the page is the dedicated page for this exact model/SKU per the Product Identity Verification rules in `skills/module-guidelines.md`. If the page is a family or category page, navigate to the specific product page before reading any content.
5. Note the source URL — this will be reported to the user
6. If no manufacturer copy exists, use the spec table and any press/media content as the factual foundation

Do not reproduce manufacturer copy verbatim. Use it as a factual and tonal reference — the goal is a rewrite into store voice, not a translation or synonym swap.

---

## Step 2 — Assess the Product

Before writing, understand what you're describing:

- **Category and use case** — is this for a beginner, a working musician, a student, a professional? Price point, series name, and specs usually signal this clearly.
- **Simple or complex** — match length to complexity; don't pad simple products.
- **Audience** — err toward explanation, but read the room. A relic-finish Jazz Bass at $440 is aimed at someone who plays. A beginner starter pack needs more hand-holding. Price point, series name, and product category are the signals.
- **Key selling points** — identify 2–4 things genuinely worth highlighting. If nothing stands out, the copy should be honest and straightforward rather than manufactured.

---

## Voice and Tone

The store's voice is **friendly, professional, and educational.** It respects the customer's intelligence without assuming expertise. It sells by informing, not by exciting.

### Do
- Write in plain, confident prose
- Explain technical terms inline when they'd be unfamiliar to a non-player
- Let the product's genuine qualities speak — if something is well-made or thoughtfully designed, say so and say why
- Use the manufacturer's own claims when they add value — attribution is fine
- Match energy to the product: a $400 student bass gets warm and approachable copy; a $2,000 pro instrument gets more precise and assured copy

### Don't
- Use AI-typical filler phrases: "whether you're a beginner or a seasoned pro," "takes your playing to the next level," "perfect for any occasion," "look no further"
- Stack adjectives: "stunning," "incredible," "revolutionary," "game-changing"
- Make claims the manufacturer didn't make
- Mention competitor products by name — "J-Bass style" or "Jazz Bass–style" is fine as a category reference; naming Fender or other brands is not
- Include links of any kind in the copy
- Write a disclaimer or warning section — leave a structural placeholder comment `<!-- DISCLAIMER: review needed -->` if the product triggers a potential disclaimer need (see Disclaimer Flags below)

---

## Copy Structure

### Body Copy
Long-form prose forming the main PDP description. Use plain paragraphs, or `[h3 / p / p]` sectioning if the product complexity warrants it. Do not force sections onto simple products.

A typical flow for an instrument:
1. **What it is and who it's for** — orient the reader without overselling
2. **Construction and materials** — what it's made of and why that matters
3. **Sound and playability** — what to expect from it in practice
4. **Standout details** — anything genuinely notable: hardware, finish, design choices
5. **Bottom line** — a brief, grounded closing that ties it together without a hard sell

For non-instrument products (cables, stands, lighting, etc.), adapt the flow to what actually matters for that product type.

**Length guidance:**
- Simple accessories: 1–2 paragraphs
- Student/entry instruments: 2–3 paragraphs
- Mid-range instruments: 3–4 paragraphs
- Pro instruments or complex gear: 4–6 paragraphs or sectioned layout

### Tonal Description (Required for All Instruments)
For any instrument with pickups, strings, or a sound-producing mechanism, the copy **must include a tonal description** — not just what the pickups are, but what the instrument actually sounds like in player terms.

**Write in player language, not spec language:**
- Not: "Two JB-style single-coil pickups deliver a clear, punchy tone"
- Yes: "articulate highs, focused mids, and tight low-end response"

Tonal descriptors should be specific enough to be useful for genre and application decisions. Name the frequency ranges that stand out, how the instrument sits in a mix, and what styles it suits naturally.

**Common player-language tonal vocabulary (reference, not a list to copy):**

| Instead of... | Consider... |
|---------------|-------------|
| "warm tone" | "full low mids, smooth on the high end" |
| "bright tone" | "present upper register, cuts through a mix" |
| "versatile" | "suits funk, blues, and rock equally well" |
| "punchy" | "tight low end, strong note attack" |
| "clear" | "articulate note separation, defined highs" |
| "balanced" | "even response across the range, no frequency spikes" |

Don't stack descriptors — two or three specific ones are more useful than five vague ones.

### Style Benchmark
This is a human-written example that represents the target voice. Use it as a calibration reference — not to copy, but to match the register, confidence, and economy of language:

> *"Equipped with two JB‑style single‑coil pickups, this bass provides articulate highs, focused mids, and tight low‑end response — ideal for funk, blues, rock, and traditional jazz tones. Its electronics layout includes master volume, master tone, plus bass and treble controls, giving players added tonal shaping without sacrificing simplicity. Vintage‑inspired appointments such as a bone nut, vintage bridge, and vintage‑style tuning machines enhance tuning stability while reinforcing the bass's classic character."*

Note what this does well:
- Groups hardware details efficiently in one sentence rather than spotlighting each
- Names specific tonal characteristics ("articulate highs, focused mids, tight low end")
- States benefits without over-explaining how they're achieved
- Closes with a phrase ("classic character") that ties aesthetics to function

### Inline Explanations
When the copy touches on something genuinely unfamiliar to a non-player, a brief inline explanation can add real value. The key word is *brief* — one clause, not a paragraph.

The test before adding an explanation:
1. Would a first-time buyer be confused without it? If no, skip it.
2. Can it be said in half a sentence woven naturally into the prose? If not, it's probably too deep for copy.
3. Lead with the benefit, not the property. Players care what it does, not how it does it.

---

## Sourcing Rules

- Copy must be grounded in confirmed manufacturer information or the provided spec table
- Do not make claims that did not come from the manufacturer or confirmed specs
- Educational additions (inline explanations) are permitted — these are your words, not manufacturer claims
- If a claim is uncertain, omit it — do not hedge with "may" or "reportedly"
- Report source at the end of the copy output:
  > *Copy based on manufacturer description: [source URL]*

---

## Competitor and Link Rules

- Never name competitor brands in copy — use category descriptors instead ("Jazz Bass–style," "traditional single-coil design," "classic offset body")
- Never include any hyperlinks in copy output
- Never reference or link to any other e-commerce store

---

## Disclaimer Flags

If the copy touches on any of the following, insert `<!-- DISCLAIMER: review needed — [reason] -->` immediately after the relevant section and continue:

- Wireless or RF-transmitting products
- Rechargeable batteries or charging hardware
- Products marketed primarily for children or students under 13
- Products with known allergen materials (certain nickel hardware, latex, etc.)
- Laser or high-intensity lighting products

---

## Output Format

Present copy in this order:

1. **Body copy** (structured prose, with inline educational notes where appropriate)
2. **Source note** (manufacturer description URL)
3. **Flags** (any conflicts, missing info, or disclaimer placeholders — brief, at the end)

Do not add a headline — the product heading handles that on the PDP.

---

## Save Output

After copy is written, save it to:

```
output/[Brand]/[Model]/[SKU]/product-description.md
```

Create the folder path if it does not already exist.

---

## Signal Complete

After `product-description.md` is written, end the session with:

> "✅ product-copy complete — output written to `output/[Brand]/[Model]/[SKU]/product-description.md`.
>
> **Full build — Step 5 is next: seo**
> End this session, then continue with:
> *"Run seo for [Brand] [Model] [SKU]"*"

---

## Edge Cases

| Situation | Action |
|-----------|--------|
| No manufacturer copy found | Write from spec table and press materials; note this in source line |
| `product-features.md` not found | Stop — tell the user product-specs must run first before copy can be written |
| Product is a bundle/kit | Write for the bundle as a whole; note key included components |
| Very simple product | Body copy may be 1–2 paragraphs; note brevity at end of output |
| Manufacturer copy is very thin | Use what exists; supplement with spec table only — do not invent |
| Conflicting specs flagged by product-specs | Do not use the conflicting value in copy; omit or use the manufacturer US site value |
