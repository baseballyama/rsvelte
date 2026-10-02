import * as $ from 'svelte/internal/server';

export default function Function01_input($$renderer) {
	let a = 'hello!';

	function fn() {}

	$$renderer.push(`<button></button> <button></button>`);
}