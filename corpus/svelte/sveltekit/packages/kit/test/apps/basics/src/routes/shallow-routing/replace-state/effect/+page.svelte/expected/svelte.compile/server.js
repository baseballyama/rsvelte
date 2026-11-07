import * as $ from 'svelte/internal/server';
import { replaceState } from '$app/navigation';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let count = 0;

		$$renderer.push(`<p>count: ${$.escape(count)}</p> <button>Increment</button>`);
	});
}