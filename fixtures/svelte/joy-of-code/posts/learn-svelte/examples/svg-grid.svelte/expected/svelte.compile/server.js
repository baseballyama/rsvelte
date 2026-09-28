import * as $ from 'svelte/internal/server';

export default function Svg_grid($$renderer) {
	let size = 300;
	let tiles = 8;

	$$renderer.push(`<div class="container"><svg${$.attr('width', size)}${$.attr('height', size)}><!--[-->`);

	const each_array = $.ensure_array_like(Array(tiles));

	for (let col = 0, $$length = each_array.length; col < $$length; col++) {
		$$renderer.push(`<!--[-->`);

		const each_array_1 = $.ensure_array_like(Array(tiles));

		for (let row = 0, $$length = each_array_1.length; row < $$length; row++) {
			const tile = size / tiles;
			const x = col * tile;
			const y = row * tile;
			const width = tile;
			const height = tile;
			const fill = (col + row) % 2 === 0 ? 'orangered' : 'white';

			$$renderer.push(`<rect${$.attr('x', x)}${$.attr('y', y)}${$.attr('width', width)}${$.attr('height', height)}${$.attr('fill', fill)}></rect>`);
		}

		$$renderer.push(`<!--]-->`);
	}

	$$renderer.push(`<!--]--></svg> <label class="svelte-1mwag0w"><span>${$.escape(tiles)} tiles:</span> <input type="range"${$.attr('value', tiles)}${$.attr('min', 1)}${$.attr('max', 40)}/></label></div>`);
}