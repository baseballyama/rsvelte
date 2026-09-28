import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<h1>This is a async svelte live code</h1>`);

export default function LiveCode89fef1a4d71($$anchor) {
	var h1 = root();

	$.append($$anchor, h1);
}