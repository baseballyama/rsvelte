import * as $ from 'svelte/internal/server';
import { getId } from './context.svelte.js';
import Layer from './Layer.svelte';

export default function RasterLayer($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			id = getId('raster-layer'),
			source = undefined,
			beforeId = undefined,
			beforeLayerType = undefined,
			paint,
			layout = undefined,
			minzoom = undefined,
			maxzoom = undefined,
			children = undefined,
			onclick = undefined,
			ondblclick = undefined,
			oncontextmenu = undefined,
			onmouseenter = undefined,
			onmousemove = undefined,
			onmouseleave = undefined
		} = $$props;

		Layer($$renderer, {
			id,
			type: 'raster',
			source,
			beforeId,
			beforeLayerType,
			paint,
			layout,
			minzoom,
			maxzoom,
			onclick,
			ondblclick,
			oncontextmenu,
			onmouseenter,
			onmousemove,
			onmouseleave,
			children: ($$renderer) => {
				children?.($$renderer);
				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});
	});
}