import * as $ from 'svelte/internal/server';
import MasonryGrid from '@sveltepress/theme-blog/components/MasonryGrid.svelte';
import TaxonomyHeader from '@sveltepress/theme-blog/components/TaxonomyHeader.svelte';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { data } = $$props;
		const tag = $.derived(() => data.tag);
		const posts = $.derived(() => data.posts);

		TaxonomyHeader($$renderer, { name: tag(), count: posts().length, type: 'tag' });
		$$renderer.push(`<!----> `);
		MasonryGrid($$renderer, { posts: posts() });
		$$renderer.push(`<!---->`);
	});
}