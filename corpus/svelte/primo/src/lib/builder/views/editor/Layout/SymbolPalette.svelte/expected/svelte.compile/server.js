import * as $ from 'svelte/internal/server';
import { createEventDispatcher, onMount } from 'svelte';

export default function SymbolPalette($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const dispatch = createEventDispatcher();

		onMount(() => {
			dispatch('mount');
		});

		$$renderer.push(`<div class="SymbolPalette svelte-l8lq2s">This is the drop zone for Blocks toggled for this Page Type. Drag any Blocks above or below this section that you want to appear on every page of this type.</div>`);
	});
}