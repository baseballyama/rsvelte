import * as $ from 'svelte/internal/server';

export default function Element_children($$renderer) {
	let tag = "div";
	let text = "Hello";
	$.element($$renderer, tag, () => {
		$$renderer.push(` id="example"`);
	}, () => {
		$$renderer.push(`<p>Hello</p>`);
	});
}
