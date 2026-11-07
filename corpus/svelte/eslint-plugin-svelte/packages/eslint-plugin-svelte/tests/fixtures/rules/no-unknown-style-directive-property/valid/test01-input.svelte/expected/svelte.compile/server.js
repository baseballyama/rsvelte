import * as $ from 'svelte/internal/server';

export default function Test01_input($$renderer) {
	let red = 'red';
	let color = red;

	$$renderer.push(`<div class="svelte-1ppgh71"${$.attr_style('', { color: red })}>...</div> <div class="svelte-1ppgh71"${$.attr_style('', { color })}>...</div> <div style="unknown-color: red" class="svelte-1ppgh71">...</div> <div class="svelte-1ppgh71"${$.attr_style('', { '--color': red })}>...</div>`);
}