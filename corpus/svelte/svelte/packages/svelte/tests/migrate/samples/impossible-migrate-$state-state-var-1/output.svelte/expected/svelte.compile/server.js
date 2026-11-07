import * as $ from 'svelte/internal/server';

export default function Output($$renderer) {
	let state = 'world';
	let other;

	$$renderer.push(`<input${$.attr('value', other)}/>`);
}