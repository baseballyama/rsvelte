import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div></div> <div></div> <div></div> <div></div>`, 1);

export default function Inline_expression_input($$anchor) {
	function foo() {}
	function bar() {}

	const param = {};
	var fragment = root();
	var div = $.first_child(fragment);

	$.action(div, ($$node) => foo?.($$node));
	$.action(div, ($$node, $$action_arg) => foo?.($$node, $$action_arg), () => param);

	var div_1 = $.sibling(div, 2);

	$.action(div_1, ($$node, $$action_arg) => foo?.($$node, $$action_arg), () => ({ a: 42 }));
	$.action(div_1, ($$node, $$action_arg) => bar?.($$node, $$action_arg), () => ({ a: 42 }));

	var div_2 = $.sibling(div_1, 2);

	$.action(div_2, ($$node, $$action_arg) => foo?.($$node, $$action_arg), () => ({ a: 42 }));
	$.action(div_2, ($$node, $$action_arg) => foo?.($$node, $$action_arg), () => ({ b: 42 }));

	var div_3 = $.sibling(div_2, 2);

	$.action(div_3, ($$node, $$action_arg) => bar?.($$node, $$action_arg), () => ({ a: 42 }));
	$.action(div_3, ($$node, $$action_arg) => bar?.($$node, $$action_arg), () => ({ a: 42, b: 42 }));
	$.append($$anchor, fragment);
}