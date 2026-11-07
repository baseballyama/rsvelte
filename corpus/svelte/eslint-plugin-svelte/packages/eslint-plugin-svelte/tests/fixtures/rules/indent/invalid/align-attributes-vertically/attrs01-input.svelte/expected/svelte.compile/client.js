import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div a="" b="" c="" d="" f=""><div a="" b="" c="" d="
">a</div></div>`);

export default function Attrs01_input($$anchor) {
	var div = root();

	$.set_attribute(div, 'e', foo);

	var div_1 = $.child(div);

	$.set_attribute(div_1, 'e', foo);
	$.set_attribute(div_1, 'f', foo);
	$.reset(div);
	$.append($$anchor, div);
}