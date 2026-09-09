import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

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
						amount: z.union([z.number(), z.string()]).optional(),
						unit: z.string().optional(),
					})
				)
				.default([]),
			rating: z.number().min(1).max(5).optional(),
			// Personal tweaks/observations, separate from the recipe body
			// (which holds the steps as written).
			notes: z.string().optional(),
			heroImage: image().optional(),
			created: z.coerce.date(),
			updated: z.coerce.date().optional(),
			// Lets a recipe be committed mid-transcription without showing up
			// anywhere (index, tags, RSS) or even building a page for it yet.
			draft: z.boolean().default(false),
		}),
});

export const collections = { blog, wiki, glossary, recipes };
