import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	let state = 'world';
	let other;

	$$renderer.push(`<input${$.attr('value', other)}/>`);
}