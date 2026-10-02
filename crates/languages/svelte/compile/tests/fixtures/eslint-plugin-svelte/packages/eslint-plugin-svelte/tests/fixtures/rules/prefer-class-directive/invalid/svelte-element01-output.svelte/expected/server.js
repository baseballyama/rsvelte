import * as $ from 'svelte/internal/server';

export default function Svelte_element01_output($$renderer) {
	let expression = 'div';
	let current = 'foo';

	$.element($$renderer, expression, () => {
		$$renderer.push(`${$.attr_class('', void 0, { 'selected': current === 'foo' })}`);
	});
}