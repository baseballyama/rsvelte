import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { createEventDispatcher, onMount } from 'svelte';

var root = $.from_html(`<div class="SymbolPalette svelte-l8lq2s">This is the drop zone for Blocks toggled for this Page Type. Drag any Blocks above or below this section that you want to appear on every page of this type.</div>`);

export default function SymbolPalette($$anchor, $$props) {
	$.push($$props, true);

	const dispatch = createEventDispatcher();

	onMount(() => {
		dispatch('mount');
	});

	var div = root();

	$.append($$anchor, div);
	$.pop();
}