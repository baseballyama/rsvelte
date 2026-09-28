import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="svelte-9qg4vm">hi</div>`);

export default function Sub($$anchor) {
	var div = root();

	$.append($$anchor, div);
}