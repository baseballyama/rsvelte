import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<span>Hello World!</span>`);

export default function Class_directive01_input($$anchor) {
	var span = root();

	$.set_class(span, 1, '', null, {}, { one: true });
	$.append($$anchor, span);
}