import * as $ from 'svelte/internal/server';

export default function Svelte_element01_input($$renderer) {
	let expression = "div";

	$.element($$renderer, expression, () => {
		$$renderer.push(` style="display:block"`);
	});
}