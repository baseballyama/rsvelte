import * as $ from 'svelte/internal/server';

export default function Test01_input($$renderer) {
	let red = 'red';
	let unknown = red;

	$$renderer.push(`<div${$.attr_style('', { 'unknown-color': red })}>...</div> <div${$.attr_style('', { unknown })}>...</div>`);
}