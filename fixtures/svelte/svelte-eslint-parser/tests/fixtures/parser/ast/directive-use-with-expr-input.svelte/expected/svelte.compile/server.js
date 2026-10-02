import * as $ from 'svelte/internal/server';

export default function Directive_use_with_expr_input($$renderer) {
	const foo = {
		bar: (node) => {
			node.textContent = 'Success';
		}
	};

	$$renderer.push(`<div></div>`);
}