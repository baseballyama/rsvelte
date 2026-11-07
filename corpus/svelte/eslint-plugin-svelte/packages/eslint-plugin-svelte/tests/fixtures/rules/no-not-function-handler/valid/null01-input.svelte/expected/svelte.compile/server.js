import * as $ from 'svelte/internal/server';

export default function Null01_input($$renderer) {
	let a = null;

	$$renderer.push(`<button></button> <button></button>`);
}