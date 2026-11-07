import * as $ from 'svelte/internal/server';

export default function Test02_input($$renderer) {
	let red = 'red';

	$$renderer.push(`<div not-style="background: red"${$.attr_style('', { background: 'green' })}>...</div>`);
}