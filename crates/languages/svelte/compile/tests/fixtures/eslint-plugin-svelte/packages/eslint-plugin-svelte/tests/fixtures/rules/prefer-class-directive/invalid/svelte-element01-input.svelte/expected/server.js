import * as $ from 'svelte/internal/server';

export default function Svelte_element01_input($$renderer) {
	let expression = 'div';
	let current = 'foo';

	$.element($$renderer, expression, () => {
		$$renderer.push(`${$.attr_class($.clsx(current === 'foo' ? 'selected' : ''))}`);
	});
}