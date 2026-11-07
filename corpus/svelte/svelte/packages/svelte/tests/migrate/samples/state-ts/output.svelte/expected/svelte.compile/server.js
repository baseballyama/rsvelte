import * as $ from 'svelte/internal/server';

export default function Output($$renderer) {
	// here is a comment
	let div = void 0;

	let count = 0;

	$$renderer.push(`<div></div> <button>${$.escape(count)}</button>`);
}