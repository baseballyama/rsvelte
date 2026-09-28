import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	let value = '';

	$$renderer.push(`<input${$.attr('value', (/** ( */
	() => value)())}/>`);
}