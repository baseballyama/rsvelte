import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div></div> <div></div>`, 1);

export default function Test01_input($$anchor) {
	function clickOutside() {}

	const param = {};
	const foo = {};
	const bar = {};
	var fragment = root();
	var div = $.first_child(fragment);

	$.action(div, ($$node) => clickOutside?.($$node));
	$.action(div, ($$node, $$action_arg) => clickOutside?.($$node, $$action_arg), () => param);

	var div_1 = $.sibling(div, 2);

	$.action(div_1, ($$node, $$action_arg) => clickOutside?.($$node, $$action_arg), () => foo);
	$.action(div_1, ($$node, $$action_arg) => clickOutside?.($$node, $$action_arg), () => bar);
	$.append($$anchor, fragment);
}