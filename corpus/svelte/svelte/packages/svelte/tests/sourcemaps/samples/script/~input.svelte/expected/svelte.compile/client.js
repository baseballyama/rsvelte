import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';

var root = $.from_html(`<div></div>`);

export default function Input($$anchor, $$props) {
	$.push($$props, true);

	onMount(() => {
		console.log(42);
	});

	var div = root();

	$.append($$anchor, div);
	$.pop();
}