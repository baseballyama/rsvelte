import * as $ from 'svelte/internal/server';

export default function ShapeGrid($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			direction = 'right',
			speed = 1,
			borderColor = '#999',
			squareSize = 40,
			hoverFillColor = '#222',
			shape = 'square',
			hoverTrailAmount = 0,
			fadeColor = '#14110E'
		} = $$props;

		let canvas = null;

		$$renderer.push(`<canvas class="w-full h-full border-none block"></canvas>`);
	});
}