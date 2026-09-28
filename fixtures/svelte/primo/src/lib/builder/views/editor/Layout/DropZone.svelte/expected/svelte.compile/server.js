import * as $ from 'svelte/internal/server';
import { createEventDispatcher, onMount } from 'svelte';

export default function DropZone($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const dispatch = createEventDispatcher();

		onMount(() => {
			dispatch('mount');
		});

		$$renderer.push(`<div class="SymbolPalette svelte-1foy1ra">This is a place you can drag any available blocks onto your page.</div>`);
	});
}