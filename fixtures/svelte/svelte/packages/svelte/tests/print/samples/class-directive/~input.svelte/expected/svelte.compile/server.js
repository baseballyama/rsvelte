import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	let active = true;
	let foo = false;

	$$renderer.push(`<div${$.attr_class('', void 0, { 'active': active, 'bar': foo })}>Hello world!</div>`);
}