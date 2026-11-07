import * as $ from 'svelte/internal/server';
import { preloadData } from '$app/navigation';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/** @type {Record<string, any> | null} */
		let data = null;

		async function onClick() {
			const result = await preloadData('/reroute/preload-data/a');

			if (result.type === 'loaded') {
				data = result.data;
			}
		}

		$$renderer.push(`<button>Preload</button> `);

		if (data) {
			$$renderer.push(`<!--[0--><pre>${$.escape(JSON.stringify(data, null, 2))}</pre>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}