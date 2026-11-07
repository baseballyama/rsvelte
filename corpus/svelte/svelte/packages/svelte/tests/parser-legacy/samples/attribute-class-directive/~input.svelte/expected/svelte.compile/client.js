import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div></div>`);

export default function Input($$anchor) {
	var div = root();

	$.set_class(div, 1, '', null, {}, { foo: isFoo });
	$.append($$anchor, div);
}