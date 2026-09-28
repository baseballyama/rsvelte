import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="foo svelte-230yvb"><div class="bar svelte-230yvb"></div></div>`);

export default function Input($$anchor) {
	var div = root();

	$.append($$anchor, div);
}