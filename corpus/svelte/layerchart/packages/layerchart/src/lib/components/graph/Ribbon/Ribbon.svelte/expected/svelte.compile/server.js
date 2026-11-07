import * as $ from 'svelte/internal/server';
import { getLayerContext } from '$lib/contexts/layer.js';
import RibbonSvg from './Ribbon.svg.svelte';
import RibbonCanvas from './Ribbon.canvas.svelte';

export default function Ribbon($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const layerCtx = getLayerContext();
		let { $$slots, $$events, ...props } = $$props;

		if (layerCtx === 'svg') {
			$$renderer.push('<!--[0-->');
			RibbonSvg($$renderer, $.spread_props([props]));
		} else if (layerCtx === 'canvas') {
			$$renderer.push('<!--[1-->');
			RibbonCanvas($$renderer, $.spread_props([props]));
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}