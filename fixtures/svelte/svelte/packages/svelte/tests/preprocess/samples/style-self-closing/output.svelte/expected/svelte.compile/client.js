import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="brand-color svelte-1r2i9td">$brand</div>`);

export default function Output($$anchor) {
	var div = root();

	$.append($$anchor, div);
}