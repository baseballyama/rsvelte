import * as $ from 'svelte/internal/server';

export default function Output($$renderer) {
	function foo() {
		// svelte-ignore reactive_declaration_invalid_placement
		$: x = 1;
	}

	$$renderer.push(`<div></div> <div></div>`);
}