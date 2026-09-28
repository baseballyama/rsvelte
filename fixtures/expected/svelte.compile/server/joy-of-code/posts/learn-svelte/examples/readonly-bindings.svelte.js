import * as $ from 'svelte/internal/server';

export default function Readonly_bindings($$renderer) {
	let width = void 0;
	let height = void 0;

	$$renderer.push(`<div class="container"><div class="example svelte-l9ubyg"><div class="text svelte-l9ubyg" contenteditable="">Edit this text</div> <div class="size svelte-l9ubyg">${$.escape(width)} x ${$.escape(height)}</div></div></div>`);
}