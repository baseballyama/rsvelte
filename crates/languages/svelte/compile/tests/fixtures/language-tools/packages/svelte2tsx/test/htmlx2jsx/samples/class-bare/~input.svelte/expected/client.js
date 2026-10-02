import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<h1>Hello</h1>`);

export default function Input($$anchor) {
	var h1 = root();

	$.set_class(h1, 1, '', null, {}, { active });
	$.append($$anchor, h1);
}