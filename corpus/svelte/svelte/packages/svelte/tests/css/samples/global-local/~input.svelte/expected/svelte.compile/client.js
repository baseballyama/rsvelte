import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="svelte-32q4le"></div>`);

export default function Input($$anchor) {
	var div = root();

	$.html(div, () => whatever, true);
	$.reset(div);
	$.append($$anchor, div);
}