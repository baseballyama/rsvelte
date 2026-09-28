import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let disabled = false;

	$$renderer.push(`<button${$.attr('disabled', disabled, true)}>Click me!</button>`);
}