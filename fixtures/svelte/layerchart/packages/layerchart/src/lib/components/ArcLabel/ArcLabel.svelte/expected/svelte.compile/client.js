import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getLayerContext } from '$lib/contexts/layer.js';
import ArcLabelSvg from './ArcLabel.svg.svelte';
import ArcLabelCanvas from './ArcLabel.canvas.svelte';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);

export default function ArcLabel($$anchor, $$props) {
	$.push($$props, true);

	const layerCtx = getLayerContext();
	let props = $.rest_props($$props, rest_excludes);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			ArcLabelSvg($$anchor, $.spread_props(() => props));
		};

		var consequent_1 = ($$anchor) => {
			ArcLabelCanvas($$anchor, $.spread_props(() => props));
		};

		$.if(node, ($$render) => {
			if (layerCtx === 'svg') $$render(consequent); else if (layerCtx === 'canvas') $$render(consequent_1, 1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}