import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div contenteditable=""></div> <div></div> <div></div>`, 1);

export default function Input($$anchor) {
	var fragment = root();
	var div = $.sibling($.first_child(fragment), 2);

	$.set_attribute(div, 'contenteditable', contentEditable);

	var div_1 = $.sibling(div, 2);

	$.set_attribute(div_1, 'contenteditable', contenteditable);
	$.append($$anchor, fragment);
}