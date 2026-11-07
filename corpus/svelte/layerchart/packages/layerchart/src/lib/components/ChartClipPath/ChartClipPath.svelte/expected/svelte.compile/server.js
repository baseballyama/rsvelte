import * as $ from 'svelte/internal/server';
import { getLayerContext } from '$lib/contexts/layer.js';
import ChartClipPathSvg from './ChartClipPath.svg.svelte';
import ChartClipPathCanvas from './ChartClipPath.canvas.svelte';
import ChartClipPathHtml from './ChartClipPath.html.svelte';

export default function ChartClipPath($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const layerCtx = getLayerContext();
		let { $$slots, $$events, ...props } = $$props;

		if (layerCtx === 'svg') {
			$$renderer.push('<!--[0-->');
			ChartClipPathSvg($$renderer, $.spread_props([props]));
		} else if (layerCtx === 'canvas') {
			$$renderer.push('<!--[1-->');
			ChartClipPathCanvas($$renderer, $.spread_props([props]));
		} else if (layerCtx === 'html') {
			$$renderer.push('<!--[2-->');
			ChartClipPathHtml($$renderer, $.spread_props([props]));
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}