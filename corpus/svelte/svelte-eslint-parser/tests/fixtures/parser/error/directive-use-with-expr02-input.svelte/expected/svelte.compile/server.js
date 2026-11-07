import * as $ from 'svelte/internal/server';

export default function Directive_use_with_expr02_input($$renderer) {
	const obj = { 'a()': (node) => node.textContent = 'Success' };

	$$renderer.push(`<div></div>`);
}