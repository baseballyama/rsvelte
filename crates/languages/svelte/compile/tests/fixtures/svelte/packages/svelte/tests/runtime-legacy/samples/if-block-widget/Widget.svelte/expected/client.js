import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p>Widget</p>`);

export default function Widget($$anchor) {
	var p = root();

	$.append($$anchor, p);
}