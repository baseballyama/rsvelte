import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div>This is nested</div>`);

export default function Nested($$anchor) {
	var div = root();

	$.append($$anchor, div);
}