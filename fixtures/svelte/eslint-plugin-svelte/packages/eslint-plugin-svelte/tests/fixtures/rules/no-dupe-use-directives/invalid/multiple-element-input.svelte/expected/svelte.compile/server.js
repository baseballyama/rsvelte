import * as $ from 'svelte/internal/server';

export default function Multiple_element_input($$renderer) {
	function foo() {}

	$$renderer.push(`<div><div><div></div> <div></div> <div></div> <div></div> <div></div></div> <div><div></div> <div></div> <div></div> <div></div> <div></div></div></div>`);
}