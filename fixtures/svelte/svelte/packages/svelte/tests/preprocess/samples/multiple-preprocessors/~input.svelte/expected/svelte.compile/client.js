import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p>one</p>`);

export default function Input($$anchor) {
	console.log('one');

	var p = root();

	$.append($$anchor, p);
}