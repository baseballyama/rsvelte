import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p>Bar</p>`);

export default function Bar($$anchor) {
	var p = root();

	$.append($$anchor, p);
}