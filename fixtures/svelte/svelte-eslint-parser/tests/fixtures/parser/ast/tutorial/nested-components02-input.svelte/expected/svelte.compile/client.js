import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p>This is another paragraph.</p>`);

export default function Nested_components02_input($$anchor) {
	var p = root();

	$.append($$anchor, p);
}