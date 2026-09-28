import * as $ from 'svelte/internal/server';
import { getContext } from 'svelte';

export default function Item($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let context = getContext('container');

		$$renderer.push(`<div>Item</div>`);
	});
}