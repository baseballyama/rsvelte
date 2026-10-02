import * as $ from 'svelte/internal/server';

export default function Test02_input($$renderer) {
	let text = '';

	$$renderer.push(`<input type="text"${$.attr('value', text)}/>`);
}