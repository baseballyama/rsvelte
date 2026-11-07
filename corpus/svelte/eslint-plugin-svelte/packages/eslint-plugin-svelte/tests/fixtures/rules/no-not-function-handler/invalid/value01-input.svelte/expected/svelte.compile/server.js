import * as $ from 'svelte/internal/server';

export default function Value01_input($$renderer) {
	const a = 42;
	const b = 42n;
	const c = /reg/;

	$$renderer.push(`<button></button> <button></button> <button></button>`);
}