import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	let foo;
	let inputType;

	$$renderer.push(`<input${$.attr('type', inputType)}/>`);
}