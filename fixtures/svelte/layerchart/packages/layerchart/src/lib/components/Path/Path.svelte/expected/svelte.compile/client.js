import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getLayerContext } from '$lib/contexts/layer.js';
import PathSvg from './Path.svg.svelte';
import PathCanvas from './Path.canvas.svelte';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'pathRef']);

export default function Path($$anchor, $$props) {
	$.push($$props, true);

	const layerCtx = getLayerContext();

	let pathRef = $.prop($$props, 'pathRef', 15),
		rest = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			PathSvg($$anchor, $.spread_props(() => rest, {
				get pathRef() {
					return pathRef();
				},

				set pathRef($$value) {
					pathRef($$value);
				}
			}));
		};

		var consequent_1 = ($$anchor) => {
			PathCanvas($$anchor, $.spread_props(() => rest));
		};

		$.if(node, ($$render) => {
			if (layerCtx === 'svg') $$render(consequent); else if (layerCtx === 'canvas') $$render(consequent_1, 1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}