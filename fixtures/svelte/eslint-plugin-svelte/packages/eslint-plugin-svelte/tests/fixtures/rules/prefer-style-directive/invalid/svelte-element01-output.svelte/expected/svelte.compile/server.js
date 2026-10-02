import * as $ from 'svelte/internal/server';

export default function Svelte_element01_output($$renderer) {
	let expression = "div";

	$.element($$renderer, expression, () => {
		$$renderer.push(`${$.attr_style('', { display: 'block' })}`);
	});
}