import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div foo="bar" class="svelte-3yw6y7"></div>`);

export default function Input($$anchor) {
	var div = root();

	$.append($$anchor, div);
}