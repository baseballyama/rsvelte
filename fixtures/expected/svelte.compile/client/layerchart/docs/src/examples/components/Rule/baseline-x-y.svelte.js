import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Axis, Chart, Layer, Rule } from 'layerchart';

var root = $.from_html(`<!> <!> <!>`, 1);

export default function Baseline_x_y($$anchor) {
	Chart($$anchor, {
		xDomain: [0, 100],
		yDomain: [0, 100],
		padding: 20,
		height: 300,
		children: ($$anchor, $$slotProps) => {
			Layer($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node = $.first_child(fragment_2);

					Axis(node, { placement: 'bottom' });

					var node_1 = $.sibling(node, 2);

					Axis(node_1, { placement: 'left' });

					var node_2 = $.sibling(node_1, 2);

					Rule(node_2, { x: true, y: true });
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}