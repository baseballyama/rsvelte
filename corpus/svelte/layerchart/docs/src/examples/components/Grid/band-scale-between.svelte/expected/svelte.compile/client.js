import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Axis, Chart, Grid, Layer } from 'layerchart';

var root = $.from_html(`<!> <!>`, 1);

export default function Band_scale_between($$anchor) {
	Chart($$anchor, {
		xDomain: ['One', 'Two', 'Three', 'Four', 'Five'],
		padding: { top: 20, bottom: 20, left: 20, right: 20 },
		height: 100,
		children: ($$anchor, $$slotProps) => {
			Layer($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node = $.first_child(fragment_2);

					Grid(node, { x: true, bandAlign: 'between' });

					var node_1 = $.sibling(node, 2);

					Axis(node_1, { placement: 'bottom', rule: true });
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}