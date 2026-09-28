import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { LayerCake, Html } from 'layercake';
import ScatterHtml from '../../_components/Scatter.html.svelte';
import QuadTreePercentRange from '../../_components/QuadTree.percent-range.html.svelte';
import data from '../../_data/points.csv';

var root = $.from_html(`<div class="circle svelte-oe2vps"></div>`);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<div class="chart-container svelte-oe2vps"><!></div>`);

export default function QuadTree_percent_range_html($$anchor) {
	// This example loads csv data as json and converts numeric columns to numbers using @rollup/plugin-dsv. See vite.config.js for details
	const xKey = 'myX';

	const yKey = 'myY';
	const r = 3;
	const padding = 6;
	var div = root_2();
	var node = $.child(div);

	LayerCake(node, {
		ssr: true,
		percentRange: true,
		padding: { top: 20 },
		x: xKey,
		y: yKey,
		xPadding: [padding, padding],
		yPadding: [padding, padding],
		get data() {
			return data;
		},

		children: ($$anchor, $$slotProps) => {
			Html($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_1 = root_1();
					var node_1 = $.first_child(fragment_1);

					ScatterHtml(node_1, { r });

					var node_2 = $.sibling(node_1, 2);

					{
						const children = ($$anchor, $$arg0) => {
							let x = () => ($$arg0?.()).x;
							let y = () => ($$arg0?.()).y;
							let visible = () => ($$arg0?.()).visible;
							var div_1 = root();

							$.template_effect(() => $.set_style(div_1, `top:${y() ?? ''}%;left:${x() ?? ''}%;display: ${visible() ? 'block' : 'none'};`));
							$.append($$anchor, div_1);
						};

						QuadTreePercentRange(node_2, { children, $$slots: { default: true } });
					}

					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
}