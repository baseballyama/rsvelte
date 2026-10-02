import * as $ from 'svelte/internal/server';

export default function Test02_output($$renderer) {
	let text = '';

	$$renderer.push(`<input type="text"${$.attr('value', text)}/>`);
}