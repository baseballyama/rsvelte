import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	function foo() {
		// svelte-ignore non-top-level-reactive-declaration
		$: x = 1;
	}

	$$renderer.push(`<div><img src="this-is-fine.jpg"/></div> <div scope=""></div> <div><img src="this-is-fine.jpg"/> <div scope=""></div></div>`);
}