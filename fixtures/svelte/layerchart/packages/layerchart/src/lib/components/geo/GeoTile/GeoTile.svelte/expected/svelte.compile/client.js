import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getLayerContext } from '$lib/contexts/layer.js';
import GeoTileSvg from './GeoTile.svg.svelte';
import GeoTileCanvas from './GeoTile.canvas.svelte';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);

export default function GeoTile($$anchor, $$props) {
	$.push($$props, true);

	const layerCtx = getLayerContext();
	let props = $.rest_props($$props, rest_excludes);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			GeoTileSvg($$anchor, $.spread_props(() => props));
		};

		var consequent_1 = ($$anchor) => {
			GeoTileCanvas($$anchor, $.spread_props(() => props));
		};

		$.if(node, ($$render) => {
			if (layerCtx === 'svg') $$render(consequent); else if (layerCtx === 'canvas') $$render(consequent_1, 1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}