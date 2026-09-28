import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	$.element(
		$$renderer,
		"svg",
		() => {
			$$renderer.push(` xmlns="http://www.w3.org/2000/svg"`);
		},
		() => {
			$.element($$renderer, "path", () => {
				$$renderer.push(` xmlns="http://www.w3.org/2000/svg"`);
			});
		}
	);
}