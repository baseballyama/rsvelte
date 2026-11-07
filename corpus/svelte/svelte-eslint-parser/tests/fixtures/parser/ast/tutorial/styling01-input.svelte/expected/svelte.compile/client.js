import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p>This is a paragraph.</p>`);

export default function Styling01_input($$anchor) {
	var p = root();

	$.append($$anchor, p);
}