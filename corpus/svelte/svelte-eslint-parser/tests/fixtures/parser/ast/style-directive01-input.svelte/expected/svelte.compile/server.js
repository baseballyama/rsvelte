import * as $ from 'svelte/internal/server';

export default function Style_directive01_input($$renderer) {
	$$renderer.push(`<div${$.attr_style('', { property: 'value' })}></div> <div${$.attr_style('', { property: 'value' })}></div> <div${$.attr_style('', { property: 'value' })}></div> <div${$.attr_style('', { color: 'red' })}>...</div>`);
}