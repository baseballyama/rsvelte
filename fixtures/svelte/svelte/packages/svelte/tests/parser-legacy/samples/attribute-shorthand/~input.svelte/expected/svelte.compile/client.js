import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div></div>`);

export default function Input($$anchor) {
	var div = root();

	$.set_attribute(div, 'id', id);
	$.append($$anchor, div);
}