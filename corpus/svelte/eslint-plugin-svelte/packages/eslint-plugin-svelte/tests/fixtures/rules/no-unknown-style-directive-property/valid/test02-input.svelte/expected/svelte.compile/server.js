import * as $ from 'svelte/internal/server';

export default function Test02_input($$renderer) {
	let transform = 'scale(2)';

	$$renderer.push(`<div${$.attr_style('', { '-moz-transform': transform })}>...</div> <div${$.attr_style('', { '-ms-transform': transform })}>...</div> <div${$.attr_style('', { '-o-transform': transform })}>...</div> <div${$.attr_style('', { '-webkit-transform': transform })}>...</div> <div${$.attr_style('', { transform })}>...</div>`);
}