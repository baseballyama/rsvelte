import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let props = { height: '100px', width: '100px', viewBox: '0 0 1000 1000' };

	$.element(
		$$renderer,
		'svg',
		() => {
			$$renderer.push(`${$.attributes({ ...props })}`);
		},
		() => {
			$$renderer.push(`<circle cx="500" cy="500" r="500"></circle>`);
		}
	);
}