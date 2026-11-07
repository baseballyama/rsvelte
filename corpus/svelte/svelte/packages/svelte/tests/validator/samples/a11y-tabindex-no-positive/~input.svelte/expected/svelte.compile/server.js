import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	let foo;

	$$renderer.push(`<button tabindex="-1">click me</button> <button tabindex="0">click me</button> <button tabindex="1">click me</button> <button${$.attr('tabindex', foo)}>click me</button>`);
}