import * as $ from 'svelte/internal/server';
import { getLayerContext } from '$lib/contexts/layer.js';
import AnnotationRangeSvg from './AnnotationRange.svg.svelte';
import AnnotationRangeCanvas from './AnnotationRange.canvas.svelte';
import AnnotationRangeHtml from './AnnotationRange.html.svelte';

export default function AnnotationRange($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const layerCtx = getLayerContext();
		let { $$slots, $$events, ...props } = $$props;

		if (layerCtx === 'svg') {
			$$renderer.push('<!--[0-->');
			AnnotationRangeSvg($$renderer, $.spread_props([props]));
		} else if (layerCtx === 'canvas') {
			$$renderer.push('<!--[1-->');
			AnnotationRangeCanvas($$renderer, $.spread_props([props]));
		} else if (layerCtx === 'html') {
			$$renderer.push('<!--[2-->');
			AnnotationRangeHtml($$renderer, $.spread_props([props]));
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}