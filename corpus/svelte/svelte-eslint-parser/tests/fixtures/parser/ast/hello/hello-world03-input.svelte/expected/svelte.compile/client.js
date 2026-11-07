import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p>...don't affect this element</p>`);

export default function Hello_world03_input($$anchor) {
	var p = root();

	$.append($$anchor, p);
}