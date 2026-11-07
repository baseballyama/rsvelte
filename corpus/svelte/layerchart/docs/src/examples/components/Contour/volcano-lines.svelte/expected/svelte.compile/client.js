import 'svelte/internal/disclose-version';
import { getVolcano } from '$lib/data.remote.js';
import * as $ from 'svelte/internal/client';
import { Axis, Chart, Contour, Layer } from 'layerchart';

const volcano = await getVolcano();
var root = $.from_html(`<!> <!> <!>`, 1);

export default function Volcano_lines($$anchor, $$props) {
	$.push($$props, true);

	Chart($$anchor, {
		padding: { left: 30, bottom: 24, top: 8, right: 8 },
		height: 400,
		children: ($$anchor, $$slotProps) => {
			Layer($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node = $.first_child(fragment_2);

					Axis(node, { placement: 'left', rule: true });

					var node_1 = $.sibling(node, 2);

					Axis(node_1, { placement: 'bottom', rule: true });

					var node_2 = $.sibling(node_1, 2);

					Contour(node_2, {
						get data() {
							return volcano.values;
						},

						get width() {
							return volcano.width;
						},

						get height() {
							return volcano.height;
						},
						fill: 'none',
						stroke: 'oklch(0.7 0.15 260)',
						strokeWidth: 0.5,
						thresholds: 20
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.pop();
}