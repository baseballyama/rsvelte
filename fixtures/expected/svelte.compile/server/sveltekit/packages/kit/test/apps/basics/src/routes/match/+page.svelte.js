import * as $ from 'svelte/internal/server';
import { match } from '$app/paths';
import { onMount } from 'svelte';
import { testPaths } from './const';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;

		/** @type {Array<{ path: string; result: { id: import('$app/types').RouteId; params: Record<string, import('@sveltejs/kit/params').ParamValue> } | null }>} */
		const clientResults = [];

		onMount(async () => {
			for (const path of testPaths) {
				const result = await match(path);

				clientResults.push({ path, result });
			}
		});

		$$renderer.push(`<h1>Match Test</h1> <div id="server-results"><!--[-->`);

		const each_array = $.ensure_array_like(data.serverResults);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let { path, result } = each_array[$$index];

			$$renderer.push(`<div class="result"${$.attr('data-path', path)}>${$.escape(JSON.stringify(result))}</div>`);
		}

		$$renderer.push(`<!--]--></div> <div id="client-results"><!--[-->`);

		const each_array_1 = $.ensure_array_like(clientResults);

		for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
			let { path, result } = each_array_1[$$index_1];

			$$renderer.push(`<div class="result"${$.attr('data-path', path)}>${$.escape(JSON.stringify(result))}</div>`);
		}

		$$renderer.push(`<!--]--></div>`);
	});
}