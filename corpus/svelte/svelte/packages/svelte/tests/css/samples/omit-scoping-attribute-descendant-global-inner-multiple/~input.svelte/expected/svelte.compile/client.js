import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="svelte-t6xpmf"></div>`);

export default function Input($$anchor) {
	var div = root();

	$.append($$anchor, div);
}