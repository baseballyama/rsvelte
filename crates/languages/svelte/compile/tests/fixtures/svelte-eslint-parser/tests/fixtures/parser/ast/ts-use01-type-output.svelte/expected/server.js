import * as $ from 'svelte/internal/server';

export default function Ts_use01_type_output($$renderer) {
	// MyActionParam: MyActionParam, p: { foo: number; }
	function myAction(_node, params) {
		// myAction: (_node: HTMLElement, params: MyActionParam) => { destroy: () => void; }, _node: HTMLElement, params: MyActionParam
		const result = params(); // result: (p: { foo: number; }) => void, params(): (p: { foo: number; }) => void

		result({ foo: 1 }); // result({ foo: 1 }): void

		return { destroy: () => {} // destroy: () => void
		 };
	}

	$$renderer.push(`<div></div>`);
}