import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<b>Hello World!</b>`);

export default function No_style01_input($$anchor) {
	var b = root();

	$.append($$anchor, b);
}