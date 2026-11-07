import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div></div>`);

export default function Rename6($$anchor) {
	function action(_, props) {}

	const foo = 1;

	action(null, { foo });

	var div = root();

	$.action(div, ($$node, $$action_arg) => action?.($$node, $$action_arg), () => ({ foo }));
	$.append($$anchor, div);
}