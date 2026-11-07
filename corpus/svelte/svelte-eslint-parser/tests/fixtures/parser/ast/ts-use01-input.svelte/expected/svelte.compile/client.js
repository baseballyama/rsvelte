import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div></div>`);

export default function Ts_use01_input($$anchor) {
	function myAction(_node, params) {
		const result = params();

		result({ foo: 1 });

		return { destroy: () => {} };
	}

	var div = root();

	$.action(div, ($$node, $$action_arg) => myAction?.($$node, $$action_arg), () => () => {
		return (param) => {
			param.foo;
		};
	});

	$.append($$anchor, div);
}