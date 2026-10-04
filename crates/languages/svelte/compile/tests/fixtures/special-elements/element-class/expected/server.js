import * as $ from 'svelte/internal/server';

export default function Element_class($$renderer) {
	let tag = "p";
	$.element($$renderer, tag, () => {
		$$renderer.push(` class="example"`);
	});
}
