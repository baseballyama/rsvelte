import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div></div>`);

export default function Input($$anchor) {
	let x = true;
	var div = root();

	$.set_attribute(
		div,
		'dir',
		// @ts-ignore
		x
	);

	$.template_effect(() => div.dir = div.dir);
	$.append($$anchor, div);
}