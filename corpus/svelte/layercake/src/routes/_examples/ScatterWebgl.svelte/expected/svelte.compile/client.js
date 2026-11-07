import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { LayerCake, Svg, WebGL, Html } from 'layercake';
import ScatterWebGL from '../../_components/Scatter.webgl.svelte';
import AxisX from '../../_components/AxisX.svelte';
import AxisY from '../../_components/AxisY.svelte';
import QuadTree from '../../_components/QuadTree.html.svelte';
import data from '../../_data/points.csv';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="circle svelte-113v25a"></div>`);
var root_2 = $.from_html(`<!> <!> <!>`, 1);
var root_3 = $.from_html(`<div class="chart-container svelte-113v25a"><!></div>`);

export default function ScatterWebgl($$anchor) {
	// This example loads csv data as json and converts numeric columns to numbers using @rollup/plugin-dsv. See vite.config.js for details
	const xKey = 'myX';

	const yKey = 'myY';
	const r = 3;
	const xyPadding = 6;
	var div = root_3();
	var node = $.child(div);

	LayerCake(node, {
		padding: { top: 5, right: 5, bottom: 20, left: 25 },
		x: xKey,
		y: yKey,
		xPadding: [xyPadding, xyPadding],
		yPadding: [xyPadding, xyPadding],
		get data() {
			return data;
		},

		children: ($$anchor, $$slotProps) => {
			var fragment = root_2();
			var node_1 = $.first_child(fragment);

			Svg(node_1, {
				children: ($$anchor, $$slotProps) => {
					var fragment_1 = root();
					var node_2 = $.first_child(fragment_1);

					AxisX(node_2, {});

					var node_3 = $.sibling(node_2, 2);

					AxisY(node_3, { tickMarks: false, ticks: 5 });
					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});

			var node_4 = $.sibling(node_1, 2);

			WebGL(node_4, {
				children: ($$anchor, $$slotProps) => {
					ScatterWebGL($$anchor, { r });
				},
				$$slots: { default: true }
			});

			var node_5 = $.sibling(node_4, 2);

			Html(node_5, {
				children: ($$anchor, $$slotProps) => {
					{
						const children = ($$anchor, $$arg0) => {
							let x = () => ($$arg0?.()).x;
							let y = () => ($$arg0?.()).y;
							let visible = () => ($$arg0?.()).visible;
							var div_1 = root_1();

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