import * as $ from 'svelte/internal/server';

export default function Element_spread($$renderer) {
	let tag = "div";
	let attrs = { id: "test" };
	$.element($$renderer, tag, () => {
		$$renderer.push(`${$.attributes({ ...attrs })}`);
	});
}
