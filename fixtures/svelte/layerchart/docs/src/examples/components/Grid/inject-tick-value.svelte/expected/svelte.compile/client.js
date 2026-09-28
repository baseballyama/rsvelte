import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Axis, Chart, Grid, Layer } from 'layerchart';

var root = $.from_html(`<!> <!>`, 1);

export default function Inject_tick_value($$anchor) {
	Chart($$anchor, {
		yDomain: [0, 100],
		padding: { top: 20, bottom: 20, left: 20, right: 20 },
		height: 300,
		children: ($$anchor, $$slotProps) => {
			Layer($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node = $.first_child(fragment_2);

					Grid(node, { y: true, yTicks: (scale) => [45, ...scale.ticks?.() ?? []] });

					var node_1 = $.sibling(node, 2);

					Axis(node_1, {
						placement: 'left',
						rule: true,
						ticks: (scale) => [45, ...scale.ticks?.() ?? []]
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}