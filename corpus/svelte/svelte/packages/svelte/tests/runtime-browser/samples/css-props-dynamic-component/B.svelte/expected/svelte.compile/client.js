import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="svelte-gcxjjf">b</div>`);

export default function B($$anchor) {
	var div = root();

	$.append($$anchor, div);
}