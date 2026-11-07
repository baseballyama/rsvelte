import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<input type="checkbox"/>`);

export default function _2_input($$anchor) {
	var input = root();

	$.append($$anchor, input);
}