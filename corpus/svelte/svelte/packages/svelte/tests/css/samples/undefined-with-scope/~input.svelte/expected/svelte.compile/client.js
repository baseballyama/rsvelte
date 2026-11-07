import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p>Foo</p> <p>Bar</p>`, 1);

export default function Input($$anchor) {
	var fragment = root();
	var p = $.first_child(fragment);

	$.set_class(p, 1, $.clsx(undefined), 'svelte-6b81cx');

	var p_1 = $.sibling(p, 2);

	$.set_class(p_1, 1, undefined, 'svelte-6b81cx');
	$.append($$anchor, fragment);
}