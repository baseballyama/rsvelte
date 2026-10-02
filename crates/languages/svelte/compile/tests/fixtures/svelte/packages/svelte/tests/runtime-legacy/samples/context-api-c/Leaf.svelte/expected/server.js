import * as $ from 'svelte/internal/server';
import { hasContext } from 'svelte';

export default function Leaf($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const has = hasContext('test');

		$$renderer.push(`<div>${$.escape(has)}</div>`);
	});
}