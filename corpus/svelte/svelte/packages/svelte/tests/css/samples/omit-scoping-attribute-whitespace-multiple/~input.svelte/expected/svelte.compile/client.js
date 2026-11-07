import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="svelte-ogns4s"><section class="svelte-ogns4s"><p class="svelte-ogns4s">this is styled</p></section></div>`);

export default function Input($$anchor) {
	var div = root();

	$.append($$anchor, div);
}