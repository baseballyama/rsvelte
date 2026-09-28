import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="maybe-grid svelte-nmmjue">something with a nice layout</div>`);

export default function Input($$anchor) {
	var div = root();

	$.append($$anchor, div);
}