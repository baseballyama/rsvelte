import * as $ from 'svelte/internal/server';

export default function Rect($$renderer) {
	const tag = 'rect';

	$.element($$renderer, tag, () => {
		$$renderer.push(` fill="black" width="10" height="90"`);
	});
}