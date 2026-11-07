import * as $ from 'svelte/internal/server';

export default function Style_directive02_input($$renderer) {
	$$renderer.push(`<div${$.attr_style('', { color: `red${$.stringify(variable)}` })}></div> <div${$.attr_style('', { color: `red${$.stringify(variable)}` })}></div> <div${$.attr_style('', { color: `red${$.stringify(variable)}` })}></div> <div${$.attr_style('', { color: `template${literal}` })}></div>`);
}