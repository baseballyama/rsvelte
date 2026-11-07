import * as $ from 'svelte/internal/server';

export default function Ternary04_input($$renderer) {
	$$renderer.push(`<div${$.attr_style(`color: ${red ? 'red' : ''};`)}>...</div>`);
}