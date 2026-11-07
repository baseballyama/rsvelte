import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="foo svelte-wd3p91"><div class="bar"></div></div>`);

export default function Style_lang02_input($$anchor) {
	var div = root();

	$.append($$anchor, div);
}