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

const wiki = defineCollection({
	loader: glob({ base: './src/content/wiki', pattern: '**/*.{md,mdx}' }),
	schema: z.object({
		title: z.string(),
		created: z.coerce.date(),
		learnedFrom: z.string().optional(),
		// This connectsTo array is what will build our Obsidian graph
		connectsTo: z.array(z.string()).default([]),
	}),
});

export const collections = { blog, wiki };
