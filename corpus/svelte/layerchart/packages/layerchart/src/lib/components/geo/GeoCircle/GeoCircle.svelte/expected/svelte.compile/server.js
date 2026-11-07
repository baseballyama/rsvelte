import * as $ from 'svelte/internal/server';
import { getLayerContext } from '$lib/contexts/layer.js';
import GeoCircleSvg from './GeoCircle.svg.svelte';
import GeoCircleCanvas from './GeoCircle.canvas.svelte';

export default function GeoCircle($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const layerCtx = getLayerContext();
		let { $$slots, $$events, ...props } = $$props;

		if (layerCtx === 'svg') {
			$$renderer.push('<!--[0-->');
			GeoCircleSvg($$renderer, $.spread_props([props]));
		} else if (layerCtx === 'canvas') {
			$$renderer.push('<!--[1-->');
			GeoCircleCanvas($$renderer, $.spread_props([props]));
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}