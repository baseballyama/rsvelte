import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="container svelte-1kbrzrm"><div class="div-class svelte-1kbrzrm">Hello</div></div>`);

export default function Descendant_combinator01_input($$anchor) {
	var div = root();

	$.append($$anchor, div);
}