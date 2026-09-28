import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div></div>`);

export default function Input($$anchor) {
	var div = root();

	$.attribute_effect(div, () => ({ ...props }));
	$.append($$anchor, div);
}