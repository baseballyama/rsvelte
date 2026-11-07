import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="svelte-1yk7nd8"></div>`);

export default function Input($$anchor) {
	var div = root();

	$.html(div, () => whatever, true);
	$.reset(div);
	$.append($$anchor, div);
}