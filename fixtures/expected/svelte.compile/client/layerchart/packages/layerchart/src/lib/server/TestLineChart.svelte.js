import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ServerChart from './ServerChart.svelte';
import Area from '$lib/components/Area/Area.svelte';
import Spline from '$lib/components/Spline/Spline.svelte';

var root = $.from_html(`<!> <!>`, 1);

export default function TestLineChart($$anchor, $$props) {
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
		padding: { top: 20, right: 20, bottom: 20, left: 20 },
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			Area(node, { fill: 'rgba(59, 130, 246, 0.15)', stroke: 'none' });

			var node_1 = $.sibling(node, 2);

			Spline(node_1, { stroke: 'rgb(59, 130, 246)', strokeWidth: 2 });
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}