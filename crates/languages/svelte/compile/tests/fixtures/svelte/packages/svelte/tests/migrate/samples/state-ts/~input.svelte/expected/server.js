import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	// here is a comment
	let div;

	let count = 0;

	$$renderer.push(`<div></div> <button>${$.escape(count)}</button>`);
}