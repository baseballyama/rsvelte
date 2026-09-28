import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="svelte-qfylai"></div>`);

export default function Output($$anchor) {
	var div = root();

	$.append($$anchor, div);
}