import * as $ from 'svelte/internal/server';
import { getLayerContext } from '$lib/contexts/layer.js';
import BlurSvg from './Blur.svg.svelte';
import BlurCanvas from './Blur.canvas.svelte';
import BlurHtml from './Blur.html.svelte';

export default function Blur($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const layerCtx = getLayerContext();
		let { $$slots, $$events, ...props } = $$props;

		if (layerCtx === 'svg') {
			$$renderer.push('<!--[0-->');
			BlurSvg($$renderer, $.spread_props([props]));
		} else if (layerCtx === 'canvas') {
			$$renderer.push('<!--[1-->');
			BlurCanvas($$renderer, $.spread_props([props]));
		} else if (layerCtx === 'html') {
			$$renderer.push('<!--[2-->');
			BlurHtml($$renderer, $.spread_props([props]));
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}