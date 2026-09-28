import * as $ from 'svelte/internal/server';
import Item from './Item.svelte';

export default function Main($$renderer) {
	let item = { heading: 'initial' };

	Item($$renderer, { item });
	$$renderer.push(`<!----> <p>${$.escape(item.heading)}</p>`);
}