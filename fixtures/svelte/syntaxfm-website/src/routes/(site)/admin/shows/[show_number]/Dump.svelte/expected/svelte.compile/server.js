import * as $ from 'svelte/internal/server';
import Dump from './Dump.svelte';
import { onMount } from 'svelte';

export default function Dump_1($$renderer, $$props) {
	let { data } = $$props;
	let entries = Object.entries(data);

	function getHeadersFromKeys(data) {
		return Object.keys(data.at(0) || {});
	}

	$$renderer.push(`<table class="svelte-1u1fciw"><thead><tr>`);

	if (Array.isArray(data)) {
		$$renderer.push(`<!--[0--><th class="svelte-1u1fciw">index</th> <!--[-->`);

		const each_array = $.ensure_array_like(getHeadersFromKeys(data));

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let header = each_array[$$index];

			$$renderer.push(`<th class="svelte-1u1fciw">${$.escape(header)}</th>`);
		}

		$$renderer.push(`<!--]-->`);
	} else {
		$$renderer.push(`<!--[-1--><th class="svelte-1u1fciw">Key</th> <th class="svelte-1u1fciw">Value</th>`);
	}

	$$renderer.push(`<!--]--></tr></thead><tbody><!--[-->`);

	const each_array_1 = $.ensure_array_like(entries);

	for (let $$index_2 = 0, $$length = each_array_1.length; $$index_2 < $$length; $$index_2++) {
		let [key, val] = each_array_1[$$index_2];

		$$renderer.push(`<tr><td class="svelte-1u1fciw">${$.escape(key)}</td>`);

		if (Array.isArray(val)) {
			$$renderer.push(`<!--[0--><td class="svelte-1u1fciw">`);
			Dump($$renderer, { data: val });
			$$renderer.push(`<!----></td>`);
		} else if (val instanceof Date) {
			$$renderer.push(`<!--[1--><td class="svelte-1u1fciw">${$.escape(val)}</td>`);
		} else if (typeof val === 'object' && val !== null) {
			$$renderer.push(`<!--[2--><!--[-->`);

			const each_array_2 = $.ensure_array_like(Object.entries(val));

			for (let $$index_1 = 0, $$length = each_array_2.length; $$index_1 < $$length; $$index_1++) {
				let [key, value] = each_array_2[$$index_1];

				$$renderer.push(`<td class="svelte-1u1fciw">${$.escape(value)}</td>`);
			}

			$$renderer.push(`<!--]-->`);
		} else {
			$$renderer.push(`<!--[-1--><td class="svelte-1u1fciw">${$.escape(val)}</td>`);
		}

		$$renderer.push(`<!--]--></tr>`);
	}

	$$renderer.push(`<!--]--></tbody></table>`);
}