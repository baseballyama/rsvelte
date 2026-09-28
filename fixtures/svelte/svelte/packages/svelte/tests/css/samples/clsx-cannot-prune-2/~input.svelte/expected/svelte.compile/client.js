import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<h1>hello world</h1>`);

export default function Input($$anchor) {
	var h1 = root();

	$.template_effect(($0) => $.set_class(h1, 1, $0, 'svelte-7lvl0j'), [() => $.clsx({ foo: true, ...rest })]);
	$.append($$anchor, h1);
}