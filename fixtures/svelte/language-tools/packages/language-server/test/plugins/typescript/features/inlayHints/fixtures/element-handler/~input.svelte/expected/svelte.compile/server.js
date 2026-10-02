import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	function log(message) {}

	$$renderer.push(`<button></button> <button></button>`);
}