import * as $ from 'svelte/internal/server';
import { page } from '$app/state';
import PageType from '$lib/builder/views/editor/PageType.svelte';
import { PageTypes } from '$lib/pocketbase/collections';
import { compilers_registered } from '$lib/stores';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const page_type_id = $.derived(() => page.params.page_type);
		const page_type = $.derived(() => page_type_id() && PageTypes.one(page_type_id()));

		if ($.store_get($$store_subs ??= {}, '$compilers_registered', compilers_registered) && page_type()) {
			$$renderer.push('<!--[0-->');
			PageType($$renderer, { page_type: page_type() });
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}