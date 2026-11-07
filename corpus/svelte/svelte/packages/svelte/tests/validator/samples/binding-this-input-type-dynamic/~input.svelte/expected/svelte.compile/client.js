import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<input/>`);

export default function Input($$anchor) {
	let foo;
	let inputType;
	var input = root();

	$.bind_this(input, ($$value) => foo = $$value, () => foo);
	$.template_effect(() => $.set_attribute(input, 'type', inputType));
	$.append($$anchor, input);
}