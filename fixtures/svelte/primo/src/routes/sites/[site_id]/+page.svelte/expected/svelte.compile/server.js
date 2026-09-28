import * as $ from 'svelte/internal/server';
import { compilers_registered } from '$lib/stores';
import PrimoPage from '$lib/builder/views/editor/Page.svelte';
import { page as pageState } from '$app/state';
import { Sites } from '$lib/pocketbase/collections';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const site_id = $.derived(() => pageState.params.site_id);
		const site = $.derived(() => Sites.one(site_id()));
		const homepage = $.derived(() => site()?.homepage());

		if ($.store_get($$store_subs ??= {}, '$compilers_registered', compilers_registered) && homepage()) {
			$$renderer.push('<!--[0-->');
			PrimoPage($$renderer, { page: homepage() });
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}