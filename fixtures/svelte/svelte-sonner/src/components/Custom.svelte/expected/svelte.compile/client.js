import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div>A custom toast with default styling</div>`);

export default function Custom($$anchor) {
	var div = root();

	$.append($$anchor, div);
}