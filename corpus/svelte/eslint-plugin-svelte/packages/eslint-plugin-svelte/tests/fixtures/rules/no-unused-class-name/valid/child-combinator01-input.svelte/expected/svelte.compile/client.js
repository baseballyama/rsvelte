import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="container svelte-d9b2n9"><div class="div-class svelte-d9b2n9">Hello</div></div>`);

export default function Child_combinator01_input($$anchor) {
	var div = root();

	$.append($$anchor, div);
}