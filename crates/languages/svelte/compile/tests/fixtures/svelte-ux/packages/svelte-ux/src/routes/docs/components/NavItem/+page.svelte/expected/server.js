import * as $ from 'svelte/internal/server';
import { NavItem } from 'svelte-ux';
import Preview from '$lib/components/Preview.svelte';
import { page } from '$app/stores';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		$$renderer.push(`<h1>Examples</h1> <h2>Default</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				NavItem($$renderer, {
					text: 'Home',
					currentUrl: $.store_get($$store_subs ??= {}, '$page', page).url,
					path: '/'
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Active path</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				NavItem($$renderer, {
					text: 'NavItem',
					currentUrl: $.store_get($$store_subs ??= {}, '$page', page).url,
					path: '/docs/components/NavItem',
					classes: { root: 'pl-3', active: 'bg-primary/10 text-primary' }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!---->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}