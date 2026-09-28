import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let props = { id: "element", class: "element-handler" };

	$.element(
		$$renderer,
		"div",
		() => {
			$$renderer.push(`${$.attributes({ ...props })}`);
		},
		() => {
			$$renderer.push(`this is a div`);
		}
	);
}