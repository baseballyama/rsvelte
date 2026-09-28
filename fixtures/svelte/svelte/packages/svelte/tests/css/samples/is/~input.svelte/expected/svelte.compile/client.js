import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<x class="svelte-110d78b"><y class="svelte-110d78b"><z class="svelte-110d78b"></z></y></x>`);

export default function Input($$anchor) {
	var x = root();

	$.append($$anchor, x);
}