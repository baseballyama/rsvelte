import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="svelte-ra5qly"><p class="svelte-ra5qly"></p></div>`);

export default function Input($$anchor) {
	var div = root();
	var p = $.child(div);

	$.html(p, () => whatever, true);
	$.reset(p);
	$.reset(div);
	$.append($$anchor, div);
}