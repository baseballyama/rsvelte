import * as $ from 'svelte/internal/server';

export default function Test01_input($$renderer) {
	let value = 'hello!';
	let active = true;
	let color = 'red';
	let foo = 42;

	$$renderer.push(`<input${$.attr('value', value)}/> <div${$.attr_class('', void 0, { 'active': active })}>...</div> <div${$.attr_style('', { color })}>...</div> <input${$.attr('value', foo)}/> <div${$.attr_class('', void 0, { 'active': foo })}>...</div> <div${$.attr_style('', { color: foo })}>...</div> <div${$.attr_style('', { color: `r${$.stringify(foo)}` })}>...</div> <div${$.attr_style('', { color: 'red' })}>...</div>`);
}