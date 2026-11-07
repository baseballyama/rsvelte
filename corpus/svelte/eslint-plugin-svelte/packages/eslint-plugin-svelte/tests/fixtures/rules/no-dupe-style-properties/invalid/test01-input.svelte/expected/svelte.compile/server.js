import * as $ from 'svelte/internal/server';

export default function Test01_input($$renderer) {
	let red = 'red';

	$$renderer.push(`<div style="background: green; background-color: red;">...</div> <div${$.attr_style('background-color: red', { background: 'green' })}>...</div> <div style="background: green; background: red;">...</div> <div${$.attr_style('background: red', { background: 'green' })}>...</div>`);
}