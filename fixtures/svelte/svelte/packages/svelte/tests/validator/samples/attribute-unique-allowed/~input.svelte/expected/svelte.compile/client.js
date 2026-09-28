import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div color="red"></div>`);

export default function Input($$anchor) {
	var div = root();

	$.set_class(div, 1, '', null, {}, { color: true });
	$.set_style(div, '', {}, { color: 'red' });
	$.append($$anchor, div);
}