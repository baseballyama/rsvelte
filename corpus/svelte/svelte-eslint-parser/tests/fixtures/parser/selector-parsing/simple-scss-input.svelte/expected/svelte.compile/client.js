import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="container svelte-102kqh8"><div class="div-class svelte-102kqh8">Hello</div> <span class="span-class svelte-102kqh8">World!</span></div>`);

export default function Simple_scss_input($$anchor) {
	var div = root();

	$.append($$anchor, div);
}