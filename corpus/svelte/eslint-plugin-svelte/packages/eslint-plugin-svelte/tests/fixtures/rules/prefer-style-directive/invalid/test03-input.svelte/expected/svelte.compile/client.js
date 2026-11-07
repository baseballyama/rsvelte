import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div style="color: red;">...</div>`);

export default function Test03_input($$anchor) {
	var div = root();

	$.append($$anchor, div);
}