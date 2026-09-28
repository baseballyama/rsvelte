import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button tabindex="-1">click me</button> <button tabindex="0">click me</button> <button tabindex="1">click me</button> <button>click me</button>`, 1);

export default function Input($$anchor) {
	let foo;
	var fragment = root();
	var button = $.sibling($.first_child(fragment), 6);

	$.template_effect(() => $.set_attribute(button, 'tabindex', foo));
	$.append($$anchor, fragment);
}