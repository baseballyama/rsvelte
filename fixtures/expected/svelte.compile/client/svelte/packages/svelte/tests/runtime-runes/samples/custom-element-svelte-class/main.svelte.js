import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div><my-element></my-element></div> <my-element></my-element>`, 3);

export default function Main($$anchor) {
	var fragment = root();
	var div = $.first_child(fragment);
	var my_element = $.child(div);

	$.set_class(my_element, 1, 'svelte-1xfnyh4');
	$.reset(div);

	var my_element_1 = $.sibling(div, 2);

	$.set_class(my_element_1, 1, 'svelte-1xfnyh4');
	$.append($$anchor, fragment);
}