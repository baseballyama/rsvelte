import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getLayerContext } from '$lib/contexts/layer.js';
import EllipseSvg from './Ellipse.svg.svelte';
import EllipseCanvas from './Ellipse.canvas.svelte';
import EllipseHtml from './Ellipse.html.svelte';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'ref']);

export default function Ellipse($$anchor, $$props) {
	$.push($$props, true);

	const layerCtx = getLayerContext();

	let ref = $.prop($$props, 'ref', 15),
		rest = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			EllipseSvg($$anchor, $.spread_props(() => rest, {
				get ref() {
					return ref();
				},

				set ref($$value) {
					ref($$value);
				}
			}));
		};

		var consequent_1 = ($$anchor) => {
			EllipseCanvas($$anchor, $.spread_props(() => rest));
		};

		var consequent_2 = ($$anchor) => {
			EllipseHtml($$anchor, $.spread_props(() => rest));
		};

		$.if(node, ($$render) => {
			if (layerCtx === 'svg') $$render(consequent); else if (layerCtx === 'canvas') $$render(consequent_1, 1); else if (layerCtx === 'html') $$render(consequent_2, 2);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}