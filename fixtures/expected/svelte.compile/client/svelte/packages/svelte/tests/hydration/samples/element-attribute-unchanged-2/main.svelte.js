import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div></div> <div></div>`, 1);

export default function Main($$anchor) {
	let foo = 'bar';
	let spread = $.proxy({ class: 'bar', foo: 'bar' });
	var fragment = root();
	var div = $.first_child(fragment);

	$.set_class(div, 1, foo);
	$.set_attribute(div, 'foo', foo);

	var div_1 = $.sibling(div, 2);

	$.attribute_effect(div_1, () => ({ ...spread }));
	$.append($$anchor, fragment);
}