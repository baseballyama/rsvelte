import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div>...</div>`);

export default function Test03_output($$anchor) {
	var div = root();

	$.set_style(div, '', {}, { color: 'red' });
	$.append($$anchor, div);
}