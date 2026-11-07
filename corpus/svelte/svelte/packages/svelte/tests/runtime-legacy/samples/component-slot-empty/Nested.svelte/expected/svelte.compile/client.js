import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p>no slot here</p>`);

export default function Nested($$anchor) {
	var p = root();

	$.append($$anchor, p);
}