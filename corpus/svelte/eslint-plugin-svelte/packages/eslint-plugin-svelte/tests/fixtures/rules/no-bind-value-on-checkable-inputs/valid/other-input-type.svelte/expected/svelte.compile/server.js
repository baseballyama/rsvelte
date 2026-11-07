import * as $ from 'svelte/internal/server';

export default function Other_input_type($$renderer) {
	let text = '';
	let value = '';

	$$renderer.push(`<input type="text"${$.attr('value', value)}/> <input type="text"${$.attr('value', text)}/>`);
}