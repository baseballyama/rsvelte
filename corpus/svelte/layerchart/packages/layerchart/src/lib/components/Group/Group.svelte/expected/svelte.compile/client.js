import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getLayerContext } from '$lib/contexts/layer.js';
import GroupSvg from './Group.svg.svelte';
import GroupCanvas from './Group.canvas.svelte';
import GroupHtml from './Group.html.svelte';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'ref']);

export default function Group($$anchor, $$props) {
	$.push($$props, true);

	const layerCtx = getLayerContext();

	let ref = $.prop($$props, 'ref', 15),
		rest = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			GroupSvg($$anchor, $.spread_props(() => rest, {
				get ref() {
					return ref();
				},

				set ref($$value) {
					ref($$value);
				}
			}));
		};

		var consequent_1 = ($$anchor) => {
			GroupCanvas($$anchor, $.spread_props(() => rest));
		};

		var consequent_2 = ($$anchor) => {
			GroupHtml($$anchor, $.spread_props(() => rest, {
				get ref() {
					return ref();
				},

				set ref($$value) {
					ref($$value);
				}
			}));
		};

		$.if(node, ($$render) => {
			if (layerCtx === 'svg') $$render(consequent); else if (layerCtx === 'canvas') $$render(consequent_1, 1); else if (layerCtx === 'html') $$render(consequent_2, 2);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}