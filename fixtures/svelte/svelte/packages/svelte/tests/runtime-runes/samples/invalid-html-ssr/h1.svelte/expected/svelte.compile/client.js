import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<h1>foo</h1>`);

export default function H1($$anchor) {
	var h1 = root();

	$.append($$anchor, h1);
}