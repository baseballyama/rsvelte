import * as $ from 'svelte/internal/server';
import MasonryGrid from '@sveltepress/theme-blog/components/MasonryGrid.svelte';
import TaxonomyHeader from '@sveltepress/theme-blog/components/TaxonomyHeader.svelte';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { data } = $$props;
		const category = $.derived(() => data.category);
		const posts = $.derived(() => data.posts);

		TaxonomyHeader($$renderer, { name: category(), count: posts().length, type: 'category' });
		$$renderer.push(`<!----> `);
		MasonryGrid($$renderer, { posts: posts() });
		$$renderer.push(`<!---->`);
	});
}