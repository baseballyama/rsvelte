import * as $ from 'svelte/internal/server';
import AdminActions from '$/lib/AdminActions.svelte';
import { enhance } from '$app/forms';
import { form_action } from '$lib/form_action';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;
		let cache = $.derived(() => $.fallback(data.cache, () => [], true));

		$$renderer.push(`<h1 class="h4">Cache</h1> `);

		AdminActions($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<form action="/?/dump_cache" method="POST"><button>Dump Cache</button></form>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <div class="table-container"><table><thead><tr><th>key</th></tr></thead><tbody>`);

		if (cache().length > 0) {
			$$renderer.push(`<!--[0--><!--[-->`);

			const each_array = $.ensure_array_like(cache());

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let key = each_array[$$index];

				$$renderer.push(`<tr><td>${$.escape(key)}</td></tr>`);
			}

			$$renderer.push(`<!--]-->`);
		} else {
			$$renderer.push(`<!--[-1--><tr><td>Cache Not Available</td></tr>`);
		}

		$$renderer.push(`<!--]--></tbody></table></div>`);
	});
}