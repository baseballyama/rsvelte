import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	$$renderer.push(`<div${$.attr_style('', { color: 'red' })}></div> <div${$.attr_style('', { color: 'red' })}></div> <div${$.attr_style('', { color: 'red' })}></div> <div${$.attr_style('', { color: `red${$.stringify(variable)}` })}></div> <div${$.attr_style('', { color: `red${$.stringify(variable)}` })}></div> <div${$.attr_style('', { color: `red${$.stringify(variable)}` })}></div> <div${$.attr_style('', { color: `template${literal}` })}></div>`);
}