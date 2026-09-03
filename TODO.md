# Site TODO

A running backlog of features considered for the site but not built yet.
Not published anywhere — just planning notes.

## Medium priority

- **Dark mode.** The site is light-only right now, and the pseudocode/real
  code blocks are already hardcoded to the `github-dark` Shiki theme
  regardless of the page — a first inconsistency that'll only get worse if
  more dark-styled elements get added ad hoc. Worth doing as a real
  light/dark toggle (or `prefers-color-scheme` support) rather than
  patching pieces individually.
- **Draft flag** (`draft: true` on wiki entries). Lets a note be written
  and committed without showing up in `/wiki`, the tag pages, the graph, or
  search until it's ready.
- **RSS for the wiki**, not just the blog. A "recently updated" feed —
  useful once the Erasmus subjects/chapters start actually being logged.

## Bigger, worth planning if wanted

- **Citations.** The thesis page already has a references list written by
  hand. A small `references` content collection + a `<Cite id="..." />`
  component (same pattern as `Term`) would let a source be cited once and
  reused across notes, with a real bibliography page generated from it.
- **Command palette / quick-jump** (Cmd+K, fuzzy search over titles + tags).
  Pairs naturally with Pagefind now that it's in place.

## Future ideas (not scoped yet)

- **Header images on entries.** A picture behind the title, with a
  darkened/lightened overlay so the title text stays readable on top of it.
- **Live edit mode.** Type a note in the browser and see it rendered in
  real time, instead of only being able to preview via `npm run dev` +
  saving the file.
- **A friendlier schematic-authoring tool.** Right now `<Schematic>`
  hotspots are hand-written coordinates in MDX; some kind of visual editor
  for placing hotspots + writing their descriptions would make it much less
  fiddly.
- **A poster/image showcase layout.** For pages like `design/posters.md`:
  a grid of images shown side by side, with a detail view on hover/click,
  instead of one long stacked list — will matter once there are more
  posters than fit comfortably on one page.
- **Social preview cards per entry.** Every wiki page currently falls back
  to a generic blog placeholder image in link previews (Slack, Discord,
  etc.) — a simple generated card (title + type badge) would look far less
  broken when a wiki link gets shared.
- **Broken-link check at build time.** Ghost nodes in `connectsTo` are
  intentional, but a typo'd markdown link (e.g. `[x](/wiki/typo)`) would
  currently 404 silently. Worth catching before it ships.
- **Orphan-page report.** The flip side of ghost nodes: pages with no
  backlinks and nothing in common tag-wise with anything else — content
  nobody would ever stumble into from another page.
- **Automatic glossary linking.** `<Term>` currently requires manually
  wrapping a mention. A pass that finds known glossary terms in plain prose
  and auto-links the first occurrence per page would make the glossary pay
  off without extra authoring effort every time.
- **Click-to-zoom on inline images.** A lightbox for regular `![]()`
  markdown images, not just the `Schematic` component — pairs naturally
  with the poster showcase above.
- **Print/study stylesheet.** A clean, single-column, no-sidebar view of a
  wiki entry for printing or reading before an exam.
- **Flashcard export from the glossary.** Since it's course material, being
  able to export glossary terms (or anything under a chosen tag) as
  spaced-repetition cards could genuinely get used around exam time.
- **Click-to-reveal "slide" component.** One block of content where each
  click/keypress reveals the next chunk (bullet, image, whatever), like a
  presentation built into the page — good for recreating or rehearsing a
  talk. Probably a generic `<Steps>` component (an array of children shown
  one at a time, advanced by click or arrow keys) rather than something
  math-specific.
- **3Blue1Brown-style progressive equation build-up.** Start small, narrate
  a piece, then grow the equation term by term with animation. True
  glyph-morphing like Manim does is its own huge project and not realistic
  here; the practical version is tagging pieces of the LaTeX with KaTeX's
  `\class{...}{...}`/`\cssId` hooks and animating each tagged span's
  opacity/position/highlight in sequence — likely built on the same
  step-advance mechanism as the slide component above.
