import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { LANGUAGES, type Lang } from './consts';

// Names in other languages, keyed by the codes in LANGUAGES (consts.ts),
// e.g. { cs: "Cibule", da: "Løg" }. Every key is optional.
const localizedNames = z
	.record(z.enum(Object.keys(LANGUAGES) as [Lang, ...Lang[]]), z.string())
	.default({});

const blog = defineCollection({
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string(),
			pubDate: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),
			heroImage: image().optional(),
		}),
});

// The kind of source/entry this wiki page represents. Drives the badge
// colour in WikiLayout and the node colour in the knowledge graph.
export const WIKI_TYPES = [
	'note',
	'subject',
	'chapter',
	'talk',
	'video',
	'project',
	'thesis',
	'reference',
	'log',
] as const;

const wiki = defineCollection({
	loader: glob({ base: './src/content/wiki', pattern: '**/*.{md,mdx}' }),
	schema: z.object({
		title: z.string(),
		created: z.coerce.date(),
		updated: z.coerce.date().optional(),
		// Where this knowledge came from: a person, a course, a talk, etc.
		learnedFrom: z.string().optional(),
		// Freeform topic labels, independent of the connectsTo concept-graph.
		// Used for /wiki/tags/[tag] and the graph filter.
		tags: z.array(z.string()).default([]),
		type: z.enum(WIKI_TYPES).default('note'),
		// Optional metadata mainly useful on `type: subject` entries
		// (e.g. an Erasmus course).
		institution: z.string().optional(),
		semester: z.string().optional(),
		ects: z.number().optional(),
		// This connectsTo array is what builds our Obsidian-style graph.
		// Entries can point at another page's title (becomes a real link)
		// or at a free-floating concept that doesn't have its own page yet
		// (becomes a "ghost" node).
		connectsTo: z.array(z.string()).default([]),
	}),
});

const glossary = defineCollection({
	loader: glob({ base: './src/content/glossary', pattern: '**/*.{md,mdx}' }),
	schema: z.object({
		term: z.string(),
		definition: z.string(),
		// Other spellings/abbreviations this entry should also match under.
		aliases: z.array(z.string()).default([]),
		tags: z.array(z.string()).default([]),
	}),
});

const recipes = defineCollection({
	loader: glob({ base: './src/content/recipes', pattern: '**/*.{md,mdx}' }),
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			// The dish's name in other languages, so it can be found by what
			// it's called in Czech or Danish. Shown under the title and on
			// cards, used as JSON-LD `alternateName`, and searchable.
			names: localizedNames,
			description: z.string(),
			tags: z.array(z.string()).default([]),
			// A link to where the recipe originally came from, if anywhere.
			source: z.string().url().optional(),
			// Minutes.
			prepTime: z.number().optional(),
			cookTime: z.number().optional(),
			servings: z.number().optional(),
			ingredients: z
				.array(
					z.object({
						name: z.string(),
						// Numbers and simple fractions ("¾", "4 ½", "1/2")
						// scale with the servings stepper; anything else
						// ("1 package") is shown as written.
						amount: z.union([z.number(), z.string()]).optional(),
						unit: z.string().optional(),
						// Sub-heading this ingredient sits under, e.g.
						// "Dough" / "Topping". Consecutive ingredients with
						// the same group are listed together.
						group: z.string().optional(),
						// Id of an entry in the `items` collection (its file
						// name, e.g. "flour"). If omitted, the ingredient
						// name is matched against item names/aliases.
						item: z.string().optional(),
					})
				)
				.default([]),
			rating: z.number().min(1).max(5).optional(),
			// Personal tweaks/observations, separate from the recipe body
			// (which holds the steps as written).
			notes: z.string().optional(),
			heroImage: image().optional(),
			// Attribution for a hero photo that isn't my own. Shown under the
			// recipe; CC BY / BY-SA licenses require it. `license` is omitted
			// for photos taken from other recipe sites (credit only).
			heroImageCredit: z
				.object({
					author: z.string(),
					license: z.string().optional(),
					// The photo's source page.
					url: z.string().url(),
				})
				.optional(),
			created: z.coerce.date(),
			updated: z.coerce.date().optional(),
			// Lets a recipe be committed mid-transcription without showing up
			// anywhere (index, tags, RSS) or even building a page for it yet.
			draft: z.boolean().default(false),
		}),
});

// The pantry: ingredients as things you buy. Recipes link to these from
// their ingredient list (see `item` above), mainly to answer "what is this
// called in Danish and where do I get it?".
const items = defineCollection({
	loader: glob({ base: './src/content/items', pattern: '**/*.{md,mdx}' }),
	schema: ({ image }) => z.object({
		name: z.string(),
		// Illustration of the item (src/assets/items/<id>.svg, from OpenMoji,
		// CC BY-SA 4.0, credited on the item page), shown on the pantry cards,
		// the item page and in the popover on recipe pages.
		image: image().optional(),
		// e.g. { cs: "Hladká mouka", da: "Hvedemel" }.
		names: localizedNames,
		// Other names recipe ingredients may use for this item; matched
		// case-insensitively, like `name` and `names`.
		aliases: z.array(z.string()).default([]),
		// Free-form grouping for the pantry page, e.g. "Baking", "Dairy".
		category: z.string().optional(),
		// One or two lines, shown in the popover on recipe pages. The
		// markdown body is for longer notes and only shows on the item page.
		description: z.string().optional(),
		where: z
			.array(
				z.object({
					store: z.string(),
					// e.g. "Copenhagen", "Prague". Entries for SHOPPING_CITY
					// (consts.ts) are listed first; omit for "anywhere".
					city: z.string().optional(),
					note: z.string().optional(),
					url: z.string().url().optional(),
				})
			)
			.default([]),
		// What to use instead where this item isn't sold as such — e.g.
		// tvaroh in Copenhagen. `city` works like in `where`.
		substitutes: z
			.array(
				z.object({
					city: z.string().optional(),
					note: z.string(),
				})
			)
			.default([]),
	}),
});

export const collections = { blog, wiki, glossary, recipes, items };
