import * as $ from 'svelte/internal/server';

export default function This_attr05_input($$renderer) {
	$.element($$renderer, 'input', () => {
		$$renderer.push(` class="foo" type="number"`);
	});

	$$renderer.push(` `);

	$.element($$renderer, `input`, () => {
		$$renderer.push(` class="foo" type="number"`);
	});
}