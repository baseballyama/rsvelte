import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onDestroy, createEventDispatcher } from 'svelte';

var root = $.from_html(`<p>i am a widget</p>`);

export default function Widget($$anchor, $$props) {
	$.push($$props, true);

	const dispatch = createEventDispatcher();

	onDestroy(() => {
		dispatch('destroy');
	});

	var p = root();

	$.append($$anchor, p);
	$.pop();
}