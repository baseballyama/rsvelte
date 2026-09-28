import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div>Hello world!</div>`);

export default function Input($$anchor) {
	let active = true;
	let foo = false;
	var div = root();

	$.set_class(div, 1, '', null, {}, { active, bar: foo });
	$.append($$anchor, div);
}