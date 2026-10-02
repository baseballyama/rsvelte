import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div>...</div>`);

export default function _2_input($$anchor) {
	var div = root();

	$.bind_element_size(div, 'clientWidth', redraw);
	$.bind_element_size(div, 'clientHeight', redraw);
	$.append($$anchor, div);
}