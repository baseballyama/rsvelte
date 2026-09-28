import * as $ from 'svelte/internal/server';
import { getContext } from 'svelte';

export default function Child($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const num = getContext('test');

		$$renderer.push(`<p>Context value: ${$.escape(num)}</p>`);
	});
}