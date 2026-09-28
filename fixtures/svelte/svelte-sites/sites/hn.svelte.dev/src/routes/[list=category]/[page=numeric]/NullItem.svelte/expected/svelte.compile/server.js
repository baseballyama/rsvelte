import * as $ from 'svelte/internal/server';

export default function NullItem($$renderer, $$props) {
	const { id, index } = $$props;

	$$renderer.push(`<article class="svelte-16n4ane"><h2 class="svelte-16n4ane">Item #${$.escape(id)} Unavailable</h2> <p class="svelte-16n4ane">API failed to return this item - maybe deleted?</p> <span class="index svelte-16n4ane">${$.escape(index)}</span></article>`);
}