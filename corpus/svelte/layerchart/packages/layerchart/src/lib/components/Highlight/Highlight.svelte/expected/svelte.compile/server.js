import * as $ from 'svelte/internal/server';
import { getLayerContext } from '$lib/contexts/layer.js';
import HighlightSvg from './Highlight.svg.svelte';
import HighlightCanvas from './Highlight.canvas.svelte';
import HighlightHtml from './Highlight.html.svelte';

export default function Highlight($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const layerCtx = getLayerContext();
		let { $$slots, $$events, ...props } = $$props;

		if (layerCtx === 'svg') {
			$$renderer.push('<!--[0-->');
			HighlightSvg($$renderer, $.spread_props([props]));
		} else if (layerCtx === 'canvas') {
			$$renderer.push('<!--[1-->');
			HighlightCanvas($$renderer, $.spread_props([props]));
		} else if (layerCtx === 'html') {
			$$renderer.push('<!--[2-->');
			HighlightHtml($$renderer, $.spread_props([props]));
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}