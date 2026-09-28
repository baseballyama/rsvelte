import * as $ from 'svelte/internal/server';
import { page } from '$app/state';
import { useProductState } from '$lib/core/composables/index.js';

export default function Product_meta_data_section($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const productState = useProductState();
		const data = $.derived(() => page.data);
		const metadataEntries = $.derived(() => Object.entries(data()?.product?.metadata || {}).filter(([key]) => !(/^(product )?specifications?$/i).test(key.trim())));

		if (metadataEntries().length) {
			$$renderer.push(`<!--[0--><div class="mt-4 edp-meta"><div class="mt-2 grid grid-cols-1 gap-4 md:grid-cols-2"><!--[-->`);

			const each_array = $.ensure_array_like(metadataEntries());

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let [key, value] = each_array[$$index];

				$$renderer.push(`<div class="card edp-meta-item"><div class="card-header"><h3 class="card-title edp-meta-key">${$.escape(key)}</h3></div> <div class="card-content edp-meta-val"><p>${$.escape(value)}</p></div></div>`);
			}

			$$renderer.push(`<!--]--></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}