import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Canvas } from '$lib';
import Rect from './Rect.svelte';
import Circle from './Circle.svelte';
import Blob from './Blob.svelte';
import Text from './Text.svelte';
import Tooltip from './Tooltip.svelte';
import { coords, activeLayer } from './store';

var root = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<div class="svelte-7096nr"><!></div>`);

export default function Demo($$anchor, $$props) {
	$.push($$props, true);

	const $coords = () => $.store_get(coords, '$coords', $$stores);
	const $activeLayer = () => $.store_get(activeLayer, '$activeLayer', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	const touch = (e) => {
		const { left, top } = e.target.getBoundingClientRect();
		const { clientX, clientY } = e.changedTouches[0];

		$.store_set(coords, [clientX - left, clientY - top]);
	};

	var div = root_1();
	var node = $.child(div);

	{
		let $0 = $.derived(() => $activeLayer() ? 'pointer' : 'default');

		Canvas(node, {
			layerEvents: true,
			get style() {
				return `cursor: ${$.get($0) ?? ''}`;
			},
			onpointermove: (e) => $.store_set(coords, [e.offsetX, e.offsetY]),
			ontouchstart: touch,
			ontouchmove: touch,
			children: ($$anchor, $$slotProps) => {
				var fragment = root();
				var node_1 = $.first_child(fragment);

				Rect(node_1, {});

				var node_2 = $.sibling(node_1, 2);

				Blob(node_2, {});

				var node_3 = $.sibling(node_2, 2);

				Circle(node_3, {});

				var node_4 = $.sibling(node_3, 2);

				Text(node_4, { text: 'svelte-canvas', yOffset: -0.03, scale: 0.06 });

				var node_5 = $.sibling(node_4, 2);

				Text(node_5, {
					text: 'Reactive canvas components',
					scale: 0.0297,
					yOffset: 0.04,
					opacity: 0.7
				});

				var node_6 = $.sibling(node_5, 2);

				{
					var consequent = ($$anchor) => {
						Tooltip($$anchor, {});
					};

					$.if(node_6, ($$render) => {
						if ($activeLayer()?.id) $$render(consequent);
					});
				}

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	}

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
	$$cleanup();
}