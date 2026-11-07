import * as $ from 'svelte/internal/server';
import { invalidate } from '$app/navigation';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/** @type {import('./$types').PageProps} */
		let { data } = $$props;

		async function update() {
			// no trailing slash, so it differs from the normalized cache key
			await fetch(`http://localhost:${data.port}`, { method: 'POST' });

			await invalidate(`http://localhost:${data.port}`);
		}

		$$renderer.push(`<h1>count: ${$.escape(data.count)}</h1> <button>update</button>`);
	});
}