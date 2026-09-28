import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ServerChart } from 'layerchart/server';
import { Axis, Bars, Grid } from 'layerchart';
import { scaleBand } from 'd3-scale';

var root = $.from_html(`<!> <!> <!> <!>`, 1);

export default function BarChart($$anchor, $$props) {
	$.push($$props, true);

	{
		let $0 = $.derived(() => scaleBand().paddingInner(0.2).paddingOuter(0.1));

		ServerChart($$anchor, {
			get capture() {
				return $$props.capture;
			},

			get onCapture() {
				return $$props.onCapture;
			},

			get width() {
				return $$props.width;
			},

			get height() {
				return $$props.height;
			},

			get data() {
				return $$props.data;
			},
			x: 'category',
			get xScale() {
				return $.get($0);
			},
			y: 'value',
			yDomain: [0, null],
			padding: { top: 20, right: 20, bottom: 30, left: 40 },
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node = $.first_child(fragment_1);

				Grid(node, { y: true, stroke: 'rgba(0,0,0,0.1)' });

				var node_1 = $.sibling(node, 2);

				Axis(node_1, {
					placement: 'bottom',
					rule: true,
					stroke: 'rgba(0,0,0,0.3)',
					fill: 'rgba(0,0,0,0.5)'
				});

				var node_2 = $.sibling(node_1, 2);

				Axis(node_2, {
					placement: 'left',
					stroke: 'rgba(0,0,0,0.3)',
					fill: 'rgba(0,0,0,0.5)'
				});

				var node_3 = $.sibling(node_2, 2);

				Bars(node_3, { fill: 'rgb(59, 130, 246)', radius: 4 });
				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	}

	$.pop();
}