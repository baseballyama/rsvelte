import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button></button>`);

export default function Input($$anchor) {
	let count = 0;
	let doubled = count * 2;
	var button = root();

	button.textContent = 'clicks: 0';
	$.append($$anchor, button);
}