import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="text-lg font-semibold">Are you sure absolutely sure?</div>`);

export default function Typography_large($$anchor) {
	var div = root();

	$.append($$anchor, div);
}