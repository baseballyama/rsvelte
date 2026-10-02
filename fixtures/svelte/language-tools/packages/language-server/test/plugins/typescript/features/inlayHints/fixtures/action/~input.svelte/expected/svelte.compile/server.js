import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	function action(ele, p) {}

	$$renderer.push(`<button></button> <button></button>`);
}