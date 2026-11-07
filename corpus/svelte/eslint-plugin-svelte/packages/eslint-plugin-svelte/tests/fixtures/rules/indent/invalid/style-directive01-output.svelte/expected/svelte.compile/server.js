import * as $ from 'svelte/internal/server';

export default function Style_directive01_output($$renderer) {
	let color = 'red';

	$$renderer.push(`<div${$.attr_style('', { color })}></div> <div${$.attr_style('', { color: ' rred ' })}></div> <div${$.attr_style('', { color })}></div> <div${$.attr_style('', { color: 'red' })}></div> <div${$.attr_style('', { color: 'red' })}></div>`);
}