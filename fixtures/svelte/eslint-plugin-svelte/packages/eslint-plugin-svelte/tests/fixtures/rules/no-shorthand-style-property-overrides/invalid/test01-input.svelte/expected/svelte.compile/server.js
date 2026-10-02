import * as $ from 'svelte/internal/server';

export default function Test01_input($$renderer) {
	let red = 'red';

	$$renderer.push(`<div${$.attr_style('', { 'background-repeat': 'repeat', background: 'green' })}>...</div> <div${$.attr_style('', { 'background-repeat': 'repeat', background: red })}>...</div> <div style="background-repeat: repeat; background: green;">...</div> <div style=" background-repeat: repeat; background: red; ">...</div> <div${$.attr_style('background: green', { 'background-repeat': 'repeat' })}>...</div> <div${$.attr_style('background: red', { 'background-repeat': 'repeat' })}>...</div>`);
}