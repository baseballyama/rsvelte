import * as $ from 'svelte/internal/server';
import { getLayerContext } from '$lib/contexts/layer.js';
import CellSvg from './Cell.svg.svelte';
import CellCanvas from './Cell.canvas.svelte';
import CellHtml from './Cell.html.svelte';

export default function Cell($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const layerCtx = getLayerContext();
		let { $$slots, $$events, ...props } = $$props;

		if (layerCtx === 'svg') {
			$$renderer.push('<!--[0-->');
			CellSvg($$renderer, $.spread_props([props]));
		} else if (layerCtx === 'canvas') {
			$$renderer.push('<!--[1-->');
			CellCanvas($$renderer, $.spread_props([props]));
		} else if (layerCtx === 'html') {
			$$renderer.push('<!--[2-->');
			CellHtml($$renderer, $.spread_props([props]));
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}