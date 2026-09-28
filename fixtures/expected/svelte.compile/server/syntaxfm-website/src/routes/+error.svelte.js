import * as $ from 'svelte/internal/server';
import { page } from '$app/stores';
import Layout from './(site)/+layout.svelte';

export default function _error($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		// error page does not automatically infer layout data...
		let { data } = $$props;

		let user = $.derived(() => data.user),
			user_theme = $.derived(() => data.user_theme);

		Layout($$renderer, {
			data: { user: user(), user_theme: user_theme(), latest: [] },
			children: ($$renderer) => {
				$$renderer.push(`<div><h2>Oopsie-daisy</h2> `);

				if ($.store_get($$store_subs ??= {}, '$page', page)?.error?.message) {
					$$renderer.push(`<!--[0--><p class="error svelte-1j96wlh">${$.escape($.store_get($$store_subs ??= {}, '$page', page).error.message)}</p>`);
				} else {
					$$renderer.push(`<!--[-1--><p class="error svelte-1j96wlh">Something went wrong. Don't worry, we use Sentry!</p>`);
				}

				$$renderer.push(`<!--]--></div>`);
			},
			$$slots: { default: true }
		});

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}