import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button></button> <button></button>`, 1);

export default function Input($$anchor) {
	function action(ele, p) {}

	var fragment = root();
	var button = $.first_child(fragment);

	$.action(button, ($$node) => action?.($$node));

	var button_1 = $.sibling(button, 2);

	$.action(button_1, ($$node, $$action_arg) => action?.($$node, $$action_arg), () => ({ p: 1 }));
	$.append($$anchor, fragment);
}