import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div>baz</div>`);

export default function Baz($$anchor) {
	var div = root();

	$.append($$anchor, div);
}