import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p>foo!</p>`);

export default function _foo_($$anchor) {
	var p = root();

	$.append($$anchor, p);
}