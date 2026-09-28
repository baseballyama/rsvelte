import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	let tag = 'hr';

	$.element($$renderer, tag, void 0, () => {
		$$renderer.push(`This text cannot appear inside an hr element`);
	});
}