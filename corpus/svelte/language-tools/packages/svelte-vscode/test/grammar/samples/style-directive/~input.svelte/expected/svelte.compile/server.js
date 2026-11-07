import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	$$renderer.push(`<div${$.attr_style('', { position })}></div> <div${$.attr_style('', { position })}></div> <div${$.attr_style('', { position: 'relative' })}></div>`);
}