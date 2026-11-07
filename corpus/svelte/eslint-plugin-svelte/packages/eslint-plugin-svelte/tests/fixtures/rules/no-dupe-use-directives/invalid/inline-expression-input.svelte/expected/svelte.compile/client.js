import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button></button> <button></button>`, 1);

export default function Inline_expression_input($$anchor) {
	function foo() {}
	function bar() {}

	var fragment = root();
	var button = $.first_child(fragment);

	$.action(button, ($$node, $$action_arg) => foo?.($$node, $$action_arg), () => () => console.log('foo'));
	$.action(button, ($$node, $$action_arg) => foo?.($$node, $$action_arg), () => () => console.log('foo'));

	var button_1 = $.sibling(button, 2);

	$.action(button_1, ($$node, $$action_arg) => bar?.($$node, $$action_arg), () => (// foo
	) => console.log('foo'));

	$.action(button_1, ($$node, $$action_arg) => bar?.($$node, $$action_arg), () => () => console.// bar
	log('foo'));

	$.append($$anchor, fragment);
}