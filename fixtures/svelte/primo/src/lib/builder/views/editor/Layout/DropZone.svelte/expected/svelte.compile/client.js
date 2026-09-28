import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { createEventDispatcher, onMount } from 'svelte';

var root = $.from_html(`<div class="SymbolPalette svelte-1foy1ra">This is a place you can drag any available blocks onto your page.</div>`);

export default function DropZone($$anchor, $$props) {
	$.push($$props, true);

	const dispatch = createEventDispatcher();

	onMount(() => {
		dispatch('mount');
	});

	var div = root();

	$.append($$anchor, div);
	$.pop();
}