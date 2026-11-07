import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="foo svelte-wlz5nw"><div class="bar"></div></div>`);

export default function Style_lang03_input($$anchor) {
	var div = root();

	$.append($$anchor, div);
}