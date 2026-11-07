import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	let x = true;

	$$renderer.push(`<div${$.attr(
		'dir',
		// @ts-ignore
		x
	)}></div>`);
}