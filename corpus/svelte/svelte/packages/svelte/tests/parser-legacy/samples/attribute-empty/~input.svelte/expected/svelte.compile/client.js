import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div a="" c=""></div>`);

export default function Input($$anchor) {
	var div = root();

	$.set_attribute(div, 'b', '');
	$.set_attribute(div, 'd', '');
	$.append($$anchor, div);
}