import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div style="display:block; position:relative;">foo</div>`);

export default function Test04_input($$anchor) {
	var div = root();

	$.append($$anchor, div);
}