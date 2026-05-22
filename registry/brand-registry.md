# Brand Registry

Source of truth for music industry manufacturer website information. Read this file whenever navigating to a manufacturer's website. Do not search the web for a brand's URL before checking here.

---

## Tool Priority — Read This First

**Always use the Chrome DevTools MCP (browser navigation tool) to open web pages. Do not use curl, WebFetch, or any non-browser fetch tool.**

Why this matters:

- Parked domains, expired domains, and "under construction" pages serve HTML that looks plausible to a fetch tool but shows nothing useful in a real browser
- JavaScript-rendered product catalogs will not load via curl — the page will appear empty or broken
- Redirect chains that end at a retailer or registrar parking page are only detectable in a browser

If Chrome DevTools MCP is not available in this environment, use whatever browser automation tool is available. If no browser tool is available at all, note this limitation explicitly before proceeding — do not silently fall back to curl without warning the user.

---

## Unlisted Brand Lookup Procedure

**If a brand is not in the Brand Directory below, follow these steps in order. Do not guess URLs. Do not open any page until Step 4.**

**Retry limit: maximum 5 search attempts (Steps 1–2) before stopping.** If five searches have not produced a credible manufacturer domain, stop and ask the user:

> "I wasn't able to find a verified manufacturer website for [Brand] after five searches. Do you have the URL, or would you like me to try a different search approach?"

### Step 1 — Web search for the official manufacturer site

Use **Brave Search** (`search.brave.com`) or **DuckDuckGo** (`duckduckgo.com`). Do not use Google — it blocks automated searches with CAPTCHAs. Do not use curl for search queries; navigate via the browser tool.

Run a web search using this exact query format:

```
"[Brand Name]" official site
```

Example: `"Latin Percussion" official site`

If that returns mostly retailer pages, add the product category:

```
"[Brand Name]" official site [category]
```

Example: `"Latin Percussion" official site percussion manufacturer`

### Step 2 — Identify the manufacturer's own domain from search results

Scan the search results for the brand's **own website** — not a retailer, distributor, or marketplace. Disqualify any result from:

- Amazon, eBay, Reverb, or any marketplace
- Sweetwater, Guitar Center, Sam Ash, Musicians Friend, or any music retailer
- Wikipedia, music news sites, or review sites
- Distributors or regional dealers

The manufacturer's site will typically:

- Have the brand name in the domain (e.g., `latinpercussion.com`, `meinlpercussion.com`)
- Be described as "official site" or "manufacturer" in the search snippet
- Show the brand's own navigation/product catalog

### Step 3 — Check for a US-specific URL

Some brands have a dedicated US subdomain or subdirectory. Common patterns:

- `us.[brand].com`
- `usa.[brand].com`
- `[brand].com/us/`
- `[brand].com/en-us/`

Note both the US version and the global root so you can fill in both columns of the Brand Directory.

### Step 4 — Verify by opening the page in a browser

**Before navigating, check the candidate domain against the Blacklisted Domains section below.** If it appears there, discard it immediately without opening the page and return to Step 1.

**Use Chrome DevTools MCP (or the available browser tool) to navigate to the candidate URL. Do not use curl or WebFetch.**

Take a screenshot or read the live page and confirm ALL of the following:

- The page shows the brand's own product catalog, navigation menus, or brand content
- It is in English and appears to serve the US market
- It is a manufacturer site, not a reseller

**Immediately discard and return to Step 1 if the page shows any of the following — these are parked or expired domains, not manufacturer sites:**

- "Under Construction" or "Coming Soon"
- "This domain is for sale" or "Buy this domain"
- Network Solutions, GoDaddy, Sedo, or any domain registrar branding
- A page of "Related Searches" links instead of product content
- A blank page or connection error

**Also discard immediately if the page shows any of the following — these are fraud or phishing indicators:**

- Checkout or payment forms appearing before any product catalog
- Prices that appear suspiciously low (e.g., 70–90% off MSRP)
- No "About", "Contact", or corporate information anywhere on the site
- Domain name is the brand name plus an unrelated word (e.g., `[brand]sound.com`, `[brand]deals.com`)
- SSL certificate warnings in the browser

If the page fails verification for any reason, do NOT add it to the registry. Return to Step 1 and search again.

### Step 5 — Propose a registry addition, then continue

Once the URL is confirmed, propose adding it to this file using the Update Workflow below. You do **not** need user approval to use the URL for the current task — only to write it to this file. Continue the build immediately after confirming the URL in Step 4.

---

## Brand Directory

| Brand            | US Market URL                 | Country-Code / Global Alt                         | CDN Pattern | Site Notes                                                                                                                                                                                                                                                                                                                                                                             |
| ---------------- | ----------------------------- | ------------------------------------------------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tagima           | https://tagimaguitars.com     | https://tagima.com.br (Brazil)                    | Shopify     | US site has English catalog; BR site may have additional regional models                                                                                                                                                                                                                                                                                                               |
| Yamaha           | https://usa.yamaha.com        | https://yamaha.com (global)                       | Proprietary | US subdomain required; global site redirects to regional versions                                                                                                                                                                                                                                                                                                                      |
| Mackie           | https://mackie.com            | N/A                                               | Shopify     | Pro audio manufacturer; mackie.com is the official US site; uses Shopify CDN at mackie.com/cdn/shop/files/ — strip width parameters                                                                                                                                                                                                                                                    |
| Ernie Ball       | https://www.ernieball.com     | https://ernieball.co.uk, https://ca.ernieball.com | Shopify     | World's leading strings manufacturer; CDN at cdn.ernieball.com; products sold in 5,500+ music stores globally; offers electric, acoustic, bass strings and accessories                                                                                                                                                                                                                 |
| Humes & Berg     | https://www.humesandberg.com  | N/A                                               | Proprietary | Stonelined mutes invented in 1935 by Willie Berg; specializes in brass instrument mutes; does not maintain full product catalog online; uses retail partners (Amazon, Guitar Center, Target, Sam Ash) for product sales                                                                                                                                                                |
| Latin Percussion | https://www.lpmusic.com       | N/A                                               | Shopify     | Major percussion instrument manufacturer specializing in Latin percussion including congas, bongos, timbales, and related accessories. Products sold through 5,000+ music stores globally. Image CDN at cdn.shopify.com                                                                                                                                                                |
| Gibraltar        | https://gibraltarhardware.com | N/A                                               | Shopify     | Drum hardware manufacturer; develops thrones, racks, stands, pedals and accessories. Image CDN at gibraltarhardware.com/cdn/shop/files/                                                                                                                                                                                                                                                |
| Hohner           | https://hohner.de/en          | N/A                                               | Proprietary | Founded 1857, "The Brand of the Blues"; German manufacturer; full product catalog available on hohner.de/en; English language site available; use Productfinder (hohner.de/en/products) for model-specific URLs; hohner.com is industrial sensors (wrong company); correct spelling is "Hohner" — do not search for "Hoehner" (ö→oe transliteration does not apply to this brand name) |
| Zildjian         | https://zildjian.com          | N/A                                               | Shopify     | Cymbals, drumsticks, and percussion; products are multi-variant (size × configuration); direct `/products/[sku]` URL 404s — use `/search?q=[sku]&type=product` or the `.js` product API to resolve variant IDs; CDN at zildjian.com/cdn/shop/ — strip `&width=` params, keep `?v=` cache-buster                                                                                        |
| Vic Firth        | https://vicfirth.com          | N/A                                               | Shopify     | Drumsticks and mallets manufacturer founded 1963; headquartered in Norwell, MA with manufacturing in Newport, ME; merged with Zildjian in 2010; signature products include American Classic, American Custom, and Corpsmaster series; CDN at vicfirth.com/cdn/shop/files/                                                                                                              |

---

## Blacklisted Domains

**Never navigate to, download from, or add any of these domains to the Brand Directory.** If a search result points to one of these, discard it and continue searching.

| Domain          | Brand Impersonated | Reason                                                                       |
| --------------- | ------------------ | ---------------------------------------------------------------------------- |
| hohnersound.com | Hohner             | Known fraud/phishing site. Impersonates Hohner to steal payment information. |

> To add a new entry, append a row to this table. Include the domain, the brand it impersonates, and a brief reason.

---

## US Market Priority

Always navigate to the US market URL first:

- Product availability and model names are US-market aligned for our catalog
- English-language pages are easier to navigate reliably
- US sites typically have the most complete product listings

If a product is not found on the US site, try the brand's global or home-country site before escalating to AIMM fallback sources.

---

## CDN & Image URL Patterns

When extracting images from manufacturer product pages, CDN behavior varies by platform.

### Shopify

- URL format: `https://[brand].com/cdn/shop/files/[filename].[ext]?v=[version]`
- **Strip width parameters** — Shopify appends `&width=300` (or similar) in page source; remove it to get full resolution
- Keep the `?v=[version]` parameter — it's a cache-buster, not a size constraint
- Example: `image.jpg?v=1774652512&width=300` → use `image.jpg?v=1774652512`
- Brands confirmed on Shopify: Tagima (`tagimaguitars.com`), Mackie (`mackie.com`), Ernie Ball (`ernieball.com`)

### Proprietary / Other

- Yamaha: Images served from `usa.yamaha.com` — no known size parameter stripping required
- Additional patterns documented here as discovered

---

## Update Workflow

After any confirmed interaction with a manufacturer's website, propose an update rather than relying on session memory.

### When to propose

- A brand's US market URL is confirmed for the first time
- A URL pattern differs from expectations (subdomain, subdirectory, country-code domain)
- A CDN or image hosting pattern is identified or confirmed
- A site structure quirk is worth noting
- A previously listed URL has changed or is no longer valid

### How to write a new row

Append a new data row to the bottom of the Brand Directory table. **Do not touch the header row or the separator row** (the line of `---` dashes immediately below the header). Only add new `|`-delimited data rows — modifying the separator row breaks the table.

### How to propose

Present the proposed change clearly before writing anything:

> "I'd like to add [Brand] to the Brand Registry:
>
> - US Market URL: `[url]`
> - Alt URL: `[url if applicable]`
> - CDN Pattern: `[Shopify / Proprietary / Other]`
> - Notes: `[anything worth flagging]`
>
> Shall I update the registry?"

Wait for explicit user approval. On approval, edit this file directly.

### What NOT to add

- Retailer URLs — this registry covers manufacturers only
- Unverified information or failed searches
