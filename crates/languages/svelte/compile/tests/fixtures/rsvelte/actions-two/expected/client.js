import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
var root = $.from_html(`<input/> <input/>`, 1);
export default function Actions_two($$anchor) {
	function first(node) {
		node.focus();
	}
	function second(node, value) {
		node.tabIndex = value;
	}
	var fragment = root();
	var input = $.first_child(fragment);
	$.action(input, ($$node) => first?.($$node));
	$.action(input, ($$node, $$action_arg) => second?.($$node, $$action_arg), () => 1);
	var input_1 = $.sibling(input, 2);
	$.action(input_1, ($$node, $$action_arg) => second?.($$node, $$action_arg), () => "x");
	$.append($$anchor, fragment);
}
