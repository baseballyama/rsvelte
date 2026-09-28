import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getLayerContext } from '$lib/contexts/layer.js';
import AnnotationPointSvg from './AnnotationPoint.svg.svelte';
import AnnotationPointCanvas from './AnnotationPoint.canvas.svelte';
import AnnotationPointHtml from './AnnotationPoint.html.svelte';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);

export default function AnnotationPoint($$anchor, $$props) {
	$.push($$props, true);

	const layerCtx = getLayerContext();
	let props = $.rest_props($$props, rest_excludes);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			AnnotationPointSvg($$anchor, $.spread_props(() => props));
		};

		var consequent_1 = ($$anchor) => {
			AnnotationPointCanvas($$anchor, $.spread_props(() => props));
		};

		var consequent_2 = ($$anchor) => {
			AnnotationPointHtml($$anchor, $.spread_props(() => props));
		};

		$.if(node, ($$render) => {
			if (layerCtx === 'svg') $$render(consequent); else if (layerCtx === 'canvas') $$render(consequent_1, 1); else if (layerCtx === 'html') $$render(consequent_2, 2);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}