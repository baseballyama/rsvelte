import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	$$renderer.push(`<div color="red"${$.attr_class('', void 0, { 'color': true })}${$.attr_style('', { color: 'red' })}></div>`);
}