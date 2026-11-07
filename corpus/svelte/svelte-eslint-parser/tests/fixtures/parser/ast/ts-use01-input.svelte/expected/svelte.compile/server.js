import * as $ from 'svelte/internal/server';

export default function Ts_use01_input($$renderer) {
	function myAction(_node, params) {
		const result = params();

		result({ foo: 1 });

		return { destroy: () => {} };
	}

	$$renderer.push(`<div></div>`);
}