import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	function myTransition(_node, _params, _context) {
		return {};
	}

	$$renderer.push(`<div></div>`);
}