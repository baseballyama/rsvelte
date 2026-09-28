import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Axis, Chart, Grid, Layer } from 'layerchart';

var root = $.from_html(`<!> <!>`, 1);

export default function Tick_count_null($$anchor) {
	Chart($$anchor, {
		yDomain: [0, 100],
		padding: { top: 20, bottom: 20, left: 20, right: 20 },
		height: 300,
		children: ($$anchor, $$slotProps) => {
			Layer($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node = $.first_child(fragment_2);

					Grid(node, { y: true, yTicks: null });

					var node_1 = $.sibling(node, 2);

					Axis(node_1, { placement: 'left', rule: true, ticks: null });
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}