import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div></div>`);

export default function Attr01_input($$anchor) {
	const a = 0;
	const b = 0;
	const c = 0;
	var div = root();

	$.set_attribute(div, 'data-text', '0 0 0');
	$.append($$anchor, div);
}