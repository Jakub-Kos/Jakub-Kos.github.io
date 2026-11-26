---
name: add-recipe
description: Add one or more recipes to the site's recipes section (src/content/recipes) with pantry items, Czech/Danish names, photos and credits. Use when the user gives a recipe URL, pastes a recipe, points at a claude.ai chat export, names a dish to create, or asks to change a recipe's photo.
---

# Adding a recipe

The user is Czech, lives in Copenhagen and shops at Bilka. Recipes are written in **English** with Czech and Danish names. Read `src/content.config.ts` for the full frontmatter spec, and look at an existing recipe such as `src/content/recipes/czech-goulash.md` or `chicken-fajita-wraps.md` as a model before writing.

## 1. Get the recipe

- **A URL:** fetch the page with `curl` (use a browser User-Agent) into the scratchpad and pull the `application/ld+json` Recipe block for ingredients and steps. If the JSON-LD is incomplete, as on joshuaweissman.com, strip the HTML to text. Set `source:` to the URL.
- **A claude.ai export** (`conversations-*.zip` in ~/Downloads): run `python3 -I .claude/skills/add-recipe/scripts/export_recipes.py <zip>` to list every recipe card, then `... <zip> "<title words>"` to dump the chosen ones. Also read the human messages that follow the card (e.g. "it was too sour") and apply them. Don't set `source:`; use the chat date as `created:`.
- **Just a dish name:** research how it's properly made (WebSearch, ideally native-language sources such as Czech for Czech dishes or Spanish for Mexican ones) and write it from that.
- If the user asks for a specific recipe "exactly", follow its amounts and method. Still write the steps in your own words rather than copying the text.

## 2. Make it a worthy dinner

The user wants proper meals, not quick snacks:

- Use the authentic technique, checked against real sources: braises take their full time, the onions get slowly browned, spices are bloomed, paprika goes in off the heat, and so on.
- Include the sides and sauces as their own ingredient groups (e.g. "Salsa roja", "To serve"), so the plate is complete.
- **Czech sauce dishes (paprikash, guláš, etc.) are always served with rice.** Never offer potatoes or knedlík as the side for these.
- Write tips and fixes in `notes`, such as what the original got wrong, what to buy in Bilka, or what to substitute.

## 3. Conventions

- Metric amounts and °C. Give fan temperatures as well, e.g. "200 °C (180 °C fan)".
- Make `amount` a number or a simple fraction (`"½"`, `"1 ¼"`) so it scales. Put units in `unit`. Text like `"1 pinch"` won't scale.
- Name ingredient sub-headings with `group`.
- Set an explicit `item:` id on every ingredient that is a real product. Check `src/content/items/` first. If the item doesn't exist, create it with `name`, `names: {cs, da}`, `category` (Baking, Dairy, Fish, Herbs, Meat, Pantry, Spices, Vegetables), `aliases`, and a `where:` (store Bilka, city Copenhagen) or `substitutes:` note if it's hard to find in Denmark. Watch for false friends: Danish *kommen* is caraway (Czech kmín), *spidskommen* is cumin, and *peberfrugt* is the vegetable while *paprika* is the spice.
- The body is a markdown ordered list, one `**Bold title.**` per step. Each step is a separate paragraph (a blank line between items), which loose lists need for images.
- Write durations as plain decimals ("2.5 hours", "20 minutes", "1–2 minutes") so `findDurations` turns them into timers. "2½ hours" is not detected.
- `names.cs` is the real Czech dish name (e.g. "Kuře na paprice"), and `names.da` a natural Danish name.
- Use a kebab-case English or Czech slug for the file name, e.g. `czech-goulash.md` or `smazeny-syr.md`.

## 4. Photos

1. **If the user gives an image URL, use it.** Their choice overrides everything else.
2. Otherwise search Wikimedia Commons with `python3 -I .claude/skills/add-recipe/scripts/commons_search.py "<query>" <scratch-dir> <prefix>`. It downloads thumbnails and prints the title, license and author. Try several queries, in English and in the dish's own language.
3. If Commons has nothing good, try the photo on Czech recipe sites (toprecepty.cz: the recipe's `og:image`, or the `...-1920-1080-nwo.jpg` variant).
4. **Look at the candidates before choosing**: make a contact sheet with `magick montage ... -set label %t` and Read it. The photo must show the dish as this recipe makes it, with the right side dish (paprikash on rice, not pasta) and the right cut (cubed chicken vs. whole legs). Crop out wrong sides if needed (`magick -crop`).
5. Save with `magick <src> -auto-orient -strip -resize 1600x1600\> -quality 82 src/assets/recipes/<slug>.jpg`. Step photos go in `src/assets/recipes/<slug>/step-N.jpg` at 900px and are embedded in the step as `![alt](../../assets/recipes/<slug>/step-N.jpg)`.
6. Set `heroImageCredit`: for Commons use `author`, `license`, and the file page `url`; for recipe sites use `author: "site.cz / author"` and `url` with no license. Credit step photos from another source in `notes`.
7. When a photo comes from a recipe site rather than Commons, tell the user once that a credit isn't permission and the photo carries takedown risk.

## 5. Verify and clean up

- `npm run build`, then grep the output for `error|warn`. An unknown `item` id prints a `[recipes] ... unknown item` warning. A "Duplicate id" warning after renaming or editing a file is usually a stale cache: `rm -rf .astro/data-store.json node_modules/.astro` and rebuild.
- Spot-check `dist/recipes/<slug>/index.html`: the count of `data-base=` (scaled amounts), the photo credit, and the step images.
- The user's disk is nearly full. Put all downloads in the session scratchpad, delete them when done, and never touch the user's files in ~/Downloads.
- **Don't commit unless asked.** When asked, commit on `main` and push. The push deploys via GitHub Pages; report the `gh run list --limit 1` run id.
- Finish with a short summary per recipe: what it is, any changes from the source and why, photo sources, new pantry items.
