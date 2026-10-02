import * as $ from 'svelte/internal/server';

export default function Test01_input($$renderer) {
	let red = 'red';

	$$renderer.push(`<div${$.attr_style('', { background: red })}>...</div> <div style="background: green">...</div> <div${$.attr_style('', { 'background-repeat': 'repeat', 'background-color': 'green' })}>...</div> <div style="background-repeat: repeat; background-color: green;">...</div> <div${$.attr_style('background-color: green', { 'background-repeat': 'repeat' })}>...</div>`);
}