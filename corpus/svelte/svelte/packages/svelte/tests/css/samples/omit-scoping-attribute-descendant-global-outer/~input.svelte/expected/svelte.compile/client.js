import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p class="svelte-1lqd9r7">this may or may not be styled</p>`);

export default function Input($$anchor) {
	var p = root();

	$.append($$anchor, p);
}