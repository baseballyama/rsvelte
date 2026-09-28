import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	let name;

	$$renderer.push(`<input${$.attr('value', name)}/>`);
}