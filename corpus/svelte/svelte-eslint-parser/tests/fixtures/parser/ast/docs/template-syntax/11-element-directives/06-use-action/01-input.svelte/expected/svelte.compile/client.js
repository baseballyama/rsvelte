import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div></div> <div></div>`, 1);

export default function _1_input($$anchor) {
	const action = (node, parameters) => ({ update: (parameters) => {}, destroy: () => {} });
	var fragment = root();
	var div = $.first_child(fragment);

	$.action(div, ($$node) => action?.($$node));

	var div_1 = $.sibling(div, 2);

	$.action(div_1, ($$node, $$action_arg) => action?.($$node, $$action_arg), () => parameters);
	$.append($$anchor, fragment);
}