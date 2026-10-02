import * as $ from 'svelte/internal/server';

function foo() {
	return (node) => node.textContent = 'Success';
}

export default function Directive_use_with_expr01_input($$renderer) {
	$$renderer.push(`<div></div>`);
}