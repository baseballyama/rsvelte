import * as $ from 'svelte/internal/server';
import PostLayout from '@sveltepress/theme-blog/PostLayout.svelte';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { data } = $$props;
		const post = $.derived(() => data.post);
		const prev = $.derived(() => data.prev);
		const next = $.derived(() => data.next);

		PostLayout($$renderer, { post: post(), prev: prev(), next: next() });
	});
}