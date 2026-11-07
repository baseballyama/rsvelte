import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p></p>`);

export default function Bar($$anchor) {
	let x = 'no';
	var p = root();

	p.textContent = 'Bar: no';
	$.append($$anchor, p);
}