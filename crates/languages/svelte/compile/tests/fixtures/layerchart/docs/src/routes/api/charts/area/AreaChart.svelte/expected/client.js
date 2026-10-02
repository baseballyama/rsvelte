import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ServerChart } from 'layerchart/server';
import { Area, Axis, Grid, Spline } from 'layerchart';

var root = $.from_html(`<!> <!> <!> <!> <!> <!> <!>`, 1);

export default function AreaChart($$anchor, $$props) {
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
		x: 'date',
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

			Area(node_3, {
				y1: 'value2',
				fill: 'rgba(249, 115, 22, 0.15)',
				stroke: 'none'
			});

			var node_4 = $.sibling(node_3, 2);

			Spline(node_4, { y: 'value2', stroke: 'rgb(249, 115, 22)', strokeWidth: 2 });

			var node_5 = $.sibling(node_4, 2);

			Area(node_5, { fill: 'rgba(59, 130, 246, 0.15)', stroke: 'none' });

			var node_6 = $.sibling(node_5, 2);

			Spline(node_6, { stroke: 'rgb(59, 130, 246)', strokeWidth: 2 });
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}