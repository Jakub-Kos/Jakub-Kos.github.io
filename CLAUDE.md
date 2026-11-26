# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — dev server at `localhost:4321`
- `npm run build` — static build to `dist/`; `postbuild` then runs `pagefind --site dist` to generate the search index
- `npm run preview` — serve the built `dist/` (the only way to test `/search`, since the Pagefind bundle at `/pagefind/` exists only after a build)
- `npm run astro -- check` — type-check `.astro`/`.ts` files and content frontmatter (needs `@astrojs/check` + `typescript`, which aren't installed yet; Astro offers to add them on first run)

There is no test suite or linter configured.

Deployment: pushing to `main` triggers `.github/workflows/` (withastro/action → GitHub Pages) at `https://jakub-kos.github.io`.

## Architecture

Astro 5 static site ("Kosakoviny") with a Solid.js island for the knowledge graph. Started from the Astro blog template; `README.md` is still the template boilerplate. `TODO.md` is the backlog of planned/considered features — check it before building something new, and update it when an item is done.

### Content collections (`src/content.config.ts`)

Four glob-loaded collections; the schema comments there are the spec for frontmatter:

- **blog** — conventional posts (`/blog`, `/rss.xml`).
- **wiki** — a nested-folder knowledge base. The entry id is its folder path (e.g. `university/bachelor/thesis/notes`), which drives `/wiki/[...slug]`, section pages at `/wiki/section/[...folder]`, breadcrumbs, and sibling navigation (helpers in `src/utils/wiki.ts`). `type` is an enum (`WIKI_TYPES`) whose label/colour lives in `TYPE_META` in `src/utils/wiki.ts` — add new types in both places.
- **glossary** — terms referenced inline from MDX via `<Term id="..." />` (`src/components/Term.astro`); missing ids render as a styled "missing" span rather than failing.
- **recipes** — `/recipes`, tag pages, and its own RSS feed. Has a `draft` flag; every recipe query must filter with `getCollection('recipes', ({ data }) => !data.draft)`. (The wiki has no draft flag yet.)

`src/content/wiki/meta/writing-guide.mdx` is the authoring cheatsheet for wiki entries (frontmatter, math, pseudocode, `Term`, `Schematic`) and doubles as a live demo of every feature.

### Wiki graph and links

`connectsTo` in wiki frontmatter holds **page titles** (not ids/slugs). A title matching an existing entry becomes a real edge; any other string becomes an intentional "ghost" node for a not-yet-written concept. `src/pages/graph.astro` builds the node/link data at build time and hands it to `GraphVisualizer.tsx` (force-graph). `WikiLayout.astro` computes backlinks the same way (`connectsTo.includes(title)`), so renaming a page's `title` silently breaks inbound links. It also builds "view history" links from `GITHUB_REPO`/`GITHUB_BRANCH` in `src/consts.ts`.

### Markdown pipeline (`astro.config.mjs`)

remark-math + rehype-katex for `$...$`/`$$...$$`. Fenced ` ```pseudocode ` blocks are aliased to Shiki's Python grammar but keep `data-language="pseudocode"` so `WikiLayout` styles them as algorithm boxes.

### Recipes

To add or change a recipe, follow the `add-recipe` skill (`.claude/skills/add-recipe/SKILL.md`): sourcing, conventions, pantry items, photos, verification.

`RecipeLayout.astro` holds the page plus all of its client behaviour, with helpers in `src/utils/recipes.ts` (shared by build and browser, so it must not import `astro:content`):

- **Servings scaling:** each amount renders as `.amt[data-base]` via `parseAmount` (numbers, `¾`, `4 ½`, `1/2`). Unparseable amounts ("1 package") show a `×n` hint instead. Text inside steps is never scaled.
- **Ingredient groups:** consecutive ingredients with the same `group` share a sub-heading.
- **Pantry items:** the `items` collection (`src/content/items/`, routes `/recipes/items[/id]`) holds localized names, `where` to buy (per `city`) and `substitutes` (per `city`). `findItem` resolves an ingredient by its `item` id, or else by matching its name against the item's name, `names` and aliases. The route `pages/recipes/[...slug].astro` resolves items and passes them in as `ingredientItems`. The layout shows a chip with the name in `SHOPPING_LANGUAGE` that opens a native `popover`. `components/ItemDetails.astro` renders substitutes and where-to-buy for both the popover and the item page, with `SHOPPING_CITY` first.
- **Timers:** `findDurations` (English, Danish and Czech units) turns durations in step text into `.timer-chip` buttons at runtime. Timers live in `#timer-tray` and persist in `localStorage`.
- **Cook mode:** focuses one step at a time (buttons, arrow keys, voice "next"/"back"/"timer"), keeps a wake lock, and remembers the current step in `sessionStorage`.
- **JSON-LD:** `schema.org/Recipe` is built in the layout frontmatter. Steps come from `extractSteps(entry.body)`, which expects the steps as a markdown ordered list.
- **Languages:** recipes and items have `names: { cs, da }`, keyed by `LANGUAGES` in `src/consts.ts`; adding a language there is all it takes. `SHOPPING_LANGUAGE` / `SHOPPING_CITY` in the same file pick the chip language and which city is listed first. `components/LocalNames.astro` renders the "CS … · DA …" line. All names feed the index search and JSON-LD `alternateName`. Durations and voice commands understand English, Danish and Czech; site chrome stays English.

### Search

Pagefind indexes only elements marked `data-pagefind-body` (set in `BlogPost`, `WikiLayout`, `RecipeLayout`, and the glossary entry page). New page types need that attribute to be searchable.
