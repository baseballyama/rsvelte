import * as $ from 'svelte/internal/server';

export default function Output($$renderer) {
	let state = 'world';
	let other = 42;

	$$renderer.push(`<input${$.attr('value', other)}/>`);
}