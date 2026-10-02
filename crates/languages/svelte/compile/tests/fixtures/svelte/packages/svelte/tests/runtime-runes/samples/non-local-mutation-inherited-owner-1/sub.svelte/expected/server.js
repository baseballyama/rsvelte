import * as $ from 'svelte/internal/server';
import { getContext } from 'svelte';

export default function Sub($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const list = getContext('list');

		$$renderer.push(`<button>[${$.escape(list.join(','))}]</button>`);
	});
}