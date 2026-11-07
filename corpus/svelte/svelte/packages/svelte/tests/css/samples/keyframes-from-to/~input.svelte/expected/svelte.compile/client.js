import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="animated svelte-8fpg6v">animated</div>`);

export default function Input($$anchor) {
	var div = root();

	$.append($$anchor, div);
}