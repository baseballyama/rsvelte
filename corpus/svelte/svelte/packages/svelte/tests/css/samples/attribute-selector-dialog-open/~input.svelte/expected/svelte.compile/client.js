import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<dialog class="svelte-1qj01dr">Hello</dialog>`);

export default function Input($$anchor) {
	var dialog = root();

	$.append($$anchor, dialog);
}