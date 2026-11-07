import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	let state = 'world';
	let other = 42;

	$$renderer.push(`<input${$.attr('value', other)}/>`);
}