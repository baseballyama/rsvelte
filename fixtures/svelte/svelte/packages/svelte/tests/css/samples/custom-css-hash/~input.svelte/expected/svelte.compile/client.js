import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="svelte-f9af0t">red</div>`);

export default function Input($$anchor) {
	var div = root();

	$.append($$anchor, div);
}