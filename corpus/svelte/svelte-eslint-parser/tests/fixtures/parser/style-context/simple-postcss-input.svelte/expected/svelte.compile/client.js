import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="container"><div class="div-class">Hello</div> <span class="span-class">World!</span></div>`);

export default function Simple_postcss_input($$anchor) {
	var div = root();

	$.append($$anchor, div);
}