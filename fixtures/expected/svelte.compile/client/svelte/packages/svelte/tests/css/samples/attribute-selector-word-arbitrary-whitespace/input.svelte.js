import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="
foo
bar
 svelte-pvxdff"></div>`);

export default function Input($$anchor) {
	var div = root();

	$.append($$anchor, div);
}