import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="svelte-1if7f8e"></div>`);

export default function Input($$anchor) {
	var div = root();

	$.append($$anchor, div);
}