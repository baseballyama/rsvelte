import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div></div>`);

export default function Style_directive03_input($$anchor) {
	const color = 'red';
	var div = root();

	$.set_style(div, '', {}, [{}, { color }]);
	$.append($$anchor, div);
}