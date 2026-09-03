// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

import solidJs from '@astrojs/solid-js';

// https://astro.build/config
export default defineConfig({
    site: 'https://jakub-kos.github.io',
    integrations: [mdx(), sitemap(), solidJs()],
    markdown: {
        remarkPlugins: [remarkMath],
        rehypePlugins: [rehypeKatex],
        // "pseudocode" isn't a real Shiki grammar. There's no such thing as
        // language-agnostic syntax highlighting, so alias it to Python's
        // grammar (closest keyword set to typical algorithm notation:
        // function/for/while/if/else/return) for IDE-like coloring, while
        // keeping its own `data-language` so WikiLayout can style it as an
        // algorithm box. For real code, just use its real language tag
        // (```python, ```cpp, ...) and Shiki highlights it properly already.
        shikiConfig: {
            langAlias: { pseudocode: 'python' },
        },
    },
});