import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="svelte-ufqluo">a</div>`);

export default function A($$anchor) {
	var div = root();

	$.append($$anchor, div);
}