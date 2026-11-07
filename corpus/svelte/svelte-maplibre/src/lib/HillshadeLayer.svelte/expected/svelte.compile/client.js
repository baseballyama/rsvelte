import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getId } from './context.svelte.js';
import Layer from './Layer.svelte';

export default function HillshadeLayer($$anchor, $$props) {
	$.push($$props, true);

	let id = $.prop($$props, 'id', 19, () => getId('hillshade-layer')),
		source = $.prop($$props, 'source', 3, undefined),
		beforeId = $.prop($$props, 'beforeId', 3, undefined),
		beforeLayerType = $.prop($$props, 'beforeLayerType', 3, undefined),
		paint = $.prop($$props, 'paint', 3, undefined),
		layout = $.prop($$props, 'layout', 3, undefined),
		minzoom = $.prop($$props, 'minzoom', 3, undefined),
		maxzoom = $.prop($$props, 'maxzoom', 3, undefined),
		children = $.prop($$props, 'children', 3, undefined),
		onclick = $.prop($$props, 'onclick', 3, undefined),
		ondblclick = $.prop($$props, 'ondblclick', 3, undefined),
		oncontextmenu = $.prop($$props, 'oncontextmenu', 3, undefined),
		onmouseenter = $.prop($$props, 'onmouseenter', 3, undefined),
		onmousemove = $.prop($$props, 'onmousemove', 3, undefined),
		onmouseleave = $.prop($$props, 'onmouseleave', 3, undefined);

	Layer($$anchor, {
		get id() {
			return id();
		},
		type: 'hillshade',
		get source() {
			return source();
		},

		get beforeId() {
			return beforeId();
		},

		get beforeLayerType() {
			return beforeLayerType();
		},

		get paint() {
			return paint();
		},

		get layout() {
			return layout();
		},

		get minzoom() {
			return minzoom();
		},

		get maxzoom() {
			return maxzoom();
		},

		get onclick() {
			return onclick();
		},

		get ondblclick() {
			return ondblclick();
		},

		get oncontextmenu() {
			return oncontextmenu();
		},

		get onmouseenter() {
			return onmouseenter();
		},

		get onmousemove() {
			return onmousemove();
		},

		get onmouseleave() {
			return onmouseleave();
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.snippet(node, () => children() ?? $.noop);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}