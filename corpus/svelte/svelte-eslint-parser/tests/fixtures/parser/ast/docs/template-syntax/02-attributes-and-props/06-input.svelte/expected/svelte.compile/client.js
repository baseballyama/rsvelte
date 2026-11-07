import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button>...</button>`);

export default function _6_input($$anchor) {
	var button = root();

	button.disabled = number !== 42;
	$.append($$anchor, button);
}