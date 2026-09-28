import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Axis, Chart, Grid, Layer } from 'layerchart';

var root = $.from_html(`<!> <!>`, 1);

export default function Explicit_ticks($$anchor) {
	Chart($$anchor, {
		yDomain: [0, 100],
		padding: { left: 20 },
		height: 200,
		children: ($$anchor, $$slotProps) => {
			Layer($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node = $.first_child(fragment_2);

					Grid(node, { y: true, yTicks: [0, 25, 50, 75, 100] });

					var node_1 = $.sibling(node, 2);

					Axis(node_1, { placement: 'left', rule: true, ticks: [0, 50, 100] });
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}