import { getCollection } from 'astro:content';
import rss from '@astrojs/rss';
import { SITE_TITLE } from '../../consts';

export async function GET(context) {
	const recipes = await getCollection('recipes', ({ data }) => !data.draft);
	return rss({
		title: `${SITE_TITLE} — Recipes`,
		description: 'Every recipe I actually cook, pulled out of chats and apps into one place.',
		site: context.site,
		items: recipes.map((recipe) => ({
			title: recipe.data.title,
			description: recipe.data.description,
			pubDate: recipe.data.created,
			link: `/recipes/${recipe.id}/`,
		})),
	});
}
