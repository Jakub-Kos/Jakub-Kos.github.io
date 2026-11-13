// Place any global data in this file.
// You can import this data from anywhere in your site by using the `import` keyword.

export const SITE_TITLE = 'Kosakoviny';
export const SITE_DESCRIPTION = 'A collection of my thoughts, notes, recipes, and projects.';

// Used to build "view history" / "edit on GitHub" links for wiki entries.
export const GITHUB_REPO = 'Jakub-Kos/Jakub-Kos.github.io';
export const GITHUB_BRANCH = 'main';

// Credited as the author in recipe structured data (JSON-LD).
export const AUTHOR_NAME = 'Jakub Kos';

// Languages that recipe and pantry-item `names` can be given in. Adding a
// language is one entry here — schema validation, search, the popovers and
// the name line under recipe titles all read from this.
export const LANGUAGES = {
	cs: { label: 'Czech', native: 'Čeština' },
	da: { label: 'Danish', native: 'Dansk' },
} as const;
export type Lang = keyof typeof LANGUAGES;

// Where I'm shopping right now. The ingredient chips on recipe pages show
// names in SHOPPING_LANGUAGE, and pantry `where` entries / substitutes for
// SHOPPING_CITY are listed first. Change both when moving.
export const SHOPPING_LANGUAGE: Lang = 'da';
export const SHOPPING_CITY = 'Copenhagen';
