import * as $ from 'svelte/internal/server';

export default function _2_input($$renderer) {
	function foo(node) {
		// the node has been mounted in the DOM
		return {
			destroy() {
				// the node has been removed from the DOM
			}
		};
	}

	$$renderer.push(`<div></div>`);
}