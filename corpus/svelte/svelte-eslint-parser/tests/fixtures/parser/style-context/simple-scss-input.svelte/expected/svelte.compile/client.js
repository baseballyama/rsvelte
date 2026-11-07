import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="container svelte-rngv97"><div class="div-class svelte-rngv97">Hello</div> <span class="span-class svelte-rngv97">World!</span></div>`);

export default function Simple_scss_input($$anchor) {
	var div = root();

	$.append($$anchor, div);
}