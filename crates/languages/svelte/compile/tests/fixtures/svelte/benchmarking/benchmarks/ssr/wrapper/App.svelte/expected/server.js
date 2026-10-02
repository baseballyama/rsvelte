import * as $ from 'svelte/internal/server';

export default function App($$renderer) {
	const wrapperWidth = 960;
	const wrapperHeight = 720;
	const cellSize = 10;
	const centerX = wrapperWidth / 2;
	const centerY = wrapperHeight / 2;
	let angle = 0;
	let radius = 0;
	let tiles = [];
	const step = cellSize;

	while (radius < Math.min(wrapperWidth, wrapperHeight) / 2) {
		let x = centerX + Math.cos(angle) * radius;
		let y = centerY + Math.sin(angle) * radius;

		if (x >= 0 && x <= wrapperWidth - cellSize && y >= 0 && y <= wrapperHeight - cellSize) {
			tiles.push({ x, y });
		}

		angle += 0.2;
		radius += step * 0.015;
	}

	$$renderer.push(`<div id="wrapper"><!--[-->`);

	const each_array = $.ensure_array_like(tiles);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let { x, y } = each_array[$$index];

		$$renderer.push(`<div class="tile"${$.attr_style(`left: ${$.stringify(x.toFixed(2))}px; top: ${$.stringify(y.toFixed(2))}px;`)}></div>`);
	}

	$$renderer.push(`<!--]--></div>`);
}