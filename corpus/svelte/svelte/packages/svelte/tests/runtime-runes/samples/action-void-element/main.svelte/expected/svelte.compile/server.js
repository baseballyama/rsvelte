import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	/** @param {HTMLInputElement} node */
	function action(node) {
		node.value = 'set from action';
	}

	$$renderer.push(`<input/> `);
	$.element($$renderer, 'input');
}