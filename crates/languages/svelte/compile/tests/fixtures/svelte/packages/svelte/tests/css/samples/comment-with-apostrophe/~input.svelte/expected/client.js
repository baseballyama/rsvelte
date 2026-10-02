import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p class="svelte-h5omsr">red</p>`);

export default function Input($$anchor) {
	var p = root();

	$.append($$anchor, p);
}