import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div><p class="svelte-zc40qd">this is styled</p></div>`);

export default function Input($$anchor) {
	var div = root();

	$.append($$anchor, div);
}