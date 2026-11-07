import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button>...</button>`);

export default function _4_input($$anchor) {
	var button = root();

	button.disabled = !clickable;
	$.append($$anchor, button);
}