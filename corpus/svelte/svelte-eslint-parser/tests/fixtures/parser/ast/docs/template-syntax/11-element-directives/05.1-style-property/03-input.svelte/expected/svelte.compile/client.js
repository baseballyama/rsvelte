import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div>This will be red</div>`);

export default function _3_input($$anchor) {
	var div = root();

	$.set_style(div, 'color: blue;', {}, { color: 'red' });
	$.append($$anchor, div);
}