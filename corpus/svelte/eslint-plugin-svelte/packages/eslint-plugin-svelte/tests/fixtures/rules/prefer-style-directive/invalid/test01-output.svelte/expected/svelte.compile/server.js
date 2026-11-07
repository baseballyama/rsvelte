import * as $ from 'svelte/internal/server';

export default function Test01_output($$renderer) {
	let red = "red";

	$$renderer.push(`<div${$.attr_style('', { color: red })}>...</div> <div${$.attr_style('', { color: red })}>...</div>`);
}