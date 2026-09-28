import * as $ from 'svelte/internal/server';
import { compilers_registered } from '$lib/stores';
import PrimoPage from '$lib/builder/views/editor/Page.svelte';
import { page as pageState } from '$app/state';
import { Sites } from '$lib/pocketbase/collections';
import { resolve_page } from '$lib/pages';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const host = $.derived(() => pageState.url.host);
		const site = $.derived(() => Sites.list({ filter: { host: host() } })?.[0]);
		const path = $.derived(() => pageState.params.page?.split('/'));
		const page = $.derived(() => site() && path() && resolve_page(site(), path()));

		if ($.store_get($$store_subs ??= {}, '$compilers_registered', compilers_registered) && page()) {
			$$renderer.push('<!--[0-->');
			PrimoPage($$renderer, { page: page() });
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}