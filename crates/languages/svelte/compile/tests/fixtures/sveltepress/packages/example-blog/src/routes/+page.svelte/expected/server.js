import * as $ from 'svelte/internal/server';
import MasonryGrid from '@sveltepress/theme-blog/components/MasonryGrid.svelte';
import Pagination from '@sveltepress/theme-blog/components/Pagination.svelte';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { data } = $$props;
		const posts = $.derived(() => data.posts);

		MasonryGrid($$renderer, { posts: posts() });
		$$renderer.push(`<!----> `);
		Pagination($$renderer, { page: data.page, total: data.total, pageSize: data.pageSize });
		$$renderer.push(`<!---->`);
	});
}