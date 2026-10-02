import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div></div>`);

export default function Ts_use01_type_output($$anchor) {
	// MyActionParam: MyActionParam, p: { foo: number; }
	function myAction(_node, params) {
		// myAction: (_node: HTMLElement, params: MyActionParam) => { destroy: () => void; }, _node: HTMLElement, params: MyActionParam
		const result = params(); // result: (p: { foo: number; }) => void, params(): (p: { foo: number; }) => void

		result({ foo: 1 }); // result({ foo: 1 }): void

		return { destroy: () => {} // destroy: () => void
		 };
	}

	var div = root();

	$.action(div, ($$node, $$action_arg) => myAction?.($$node, $$action_arg), () => () => {
		// myAction: (_node: HTMLElement, params: MyActionParam) => { destroy: () => void; }
		return (param) => {
			// param: { foo: number; }
			param.foo; // param.foo: number
		};
	});

	$.append($$anchor, div);
}