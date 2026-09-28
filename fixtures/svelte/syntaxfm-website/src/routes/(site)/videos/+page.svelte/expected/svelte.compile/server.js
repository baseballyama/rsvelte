import * as $ from 'svelte/internal/server';
import PlaylistCard from '$lib/videos/PlaylistCard.svelte';
import { page } from '$app/stores';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { data } = $$props;
		let playlists = $.derived(() => data.playlists);

		// We tell google to ignore filters, BUT not ?page=2...Infinity
		let isNoindexPage = $.derived(() => ['order', 'type', 'sort', 'perPage'].some((filter) => $.store_get($$store_subs ??= {}, '$page', page).url.searchParams.has(filter)));

		$.head('x0ubh4', $$renderer, ($$renderer) => {
			if (isNoindexPage()) {
				$$renderer.push(`<!--[0--><meta name="robots" content="noindex"/>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		});

		$$renderer.push(`<section class="svelte-x0ubh4"><div class="list-heading svelte-x0ubh4"><h1 class="h3">All Playlists</h1></div>  <div class="playlists"><!--[-->`);

		const each_array = $.ensure_array_like(playlists());

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let playlist = each_array[$$index];

			PlaylistCard($$renderer, { playlist });
		}

		$$renderer.push(`<!--]--></div></section>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}