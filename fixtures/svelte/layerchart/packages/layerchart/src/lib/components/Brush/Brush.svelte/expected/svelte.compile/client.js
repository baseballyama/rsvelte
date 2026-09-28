import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getLayerContext } from '$lib/contexts/layer.js';
import BrushSvg from './Brush.svg.svelte';
import BrushCanvas from './Brush.canvas.svelte';
import BrushHtml from './Brush.html.svelte';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'state']);

export default function Brush($$anchor, $$props) {
	$.push($$props, true);

	let stateProp = $.prop($$props, 'state', 15),
		rest = $.rest_props($$props, rest_excludes);

	const layerCtx = getLayerContext();
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			BrushCanvas($$anchor, $.spread_props(() => rest, {
				get state() {
					return stateProp();
				},

				set state($$value) {
					stateProp($$value);
				}
			}));
		};

		var consequent_1 = ($$anchor) => {
			BrushHtml($$anchor, $.spread_props(() => rest, {
				get state() {
					return stateProp();
				},

				set state($$value) {
					stateProp($$value);
				}
			}));
		};

		var alternate = ($$anchor) => {
			BrushSvg($$anchor, $.spread_props(() => rest, {
				get state() {
					return stateProp();
				},

				set state($$value) {
					stateProp($$value);
				}
			}));
		};

		$.if(node, ($$render) => {
			if (layerCtx === 'canvas') $$render(consequent); else if (layerCtx === 'html') $$render(consequent_1, 1); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}