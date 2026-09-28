import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="large-screen svelte-1x29d22">animated</div>`);

export default function Input($$anchor) {
	var div = root();

	$.append($$anchor, div);
}