import * as $ from 'svelte/internal/server';

export default function Test01_input($$renderer) {
	let value = 'hello!';
	let active = true;
	let color = 'red';

	$$renderer.push(`<input${$.attr('value', value)}/> <div${$.attr_class('', void 0, { 'active': active })}>...</div> <div${$.attr_style('', { color })}>...</div>`);
}