import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="foo"><button disabled="">can't touch this</button></div>`);

export default function _1_input($$anchor) {
	var div = root();

	$.append($$anchor, div);
}