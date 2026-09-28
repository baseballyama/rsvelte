import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { LayerCake, Svg, Html } from 'layercake';
import ScatterSvg from '../../_components/Scatter.svg.svelte';
import QuadTree from '../../_components/QuadTree.html.svelte';
import data from '../../_data/points.csv';

var root = $.from_html(`<div class="circle svelte-1qtrb52"></div>`);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<div class="chart-container svelte-1qtrb52"><!></div>`);

export default function QuadTree_html($$anchor) {
	// This example loads csv data as json and converts numeric columns to numbers using @rollup/plugin-dsv. See vite.config.js for details
	const xKey = 'myX';

	const yKey = 'myY';
	const r = 3;
	const padding = 6;
	var div = root_2();
	var node = $.child(div);

	LayerCake(node, {
		padding: { top: 20 },
		x: xKey,
		y: yKey,
		xPadding: [padding, padding],
		yPadding: [padding, padding],
		get data() {
			return data;
		},

		children: ($$anchor, $$slotProps) => {
			var fragment = root_1();
			var node_1 = $.first_child(fragment);

			Svg(node_1, {
				children: ($$anchor, $$slotProps) => {
					ScatterSvg($$anchor, { r });
				},
				$$slots: { default: true }
			});

			var node_2 = $.sibling(node_1, 2);

			Html(node_2, {
				children: ($$anchor, $$slotProps) => {
					{
						const children = ($$anchor, $$arg0) => {
							let x = () => ($$arg0?.()).x;
							let y = () => ($$arg0?.()).y;
							let visible = () => ($$arg0?.()).visible;
							var div_1 = root();

							$.template_effect(() => $.set_style(div_1, `top:${y() ?? ''}px;left:${x() ?? ''}px;display: ${visible() ? 'block' : 'none'};`));
							$.append($$anchor, div_1);
						};

						QuadTree($$anchor, { children, $$slots: { default: true } });
					}
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
}