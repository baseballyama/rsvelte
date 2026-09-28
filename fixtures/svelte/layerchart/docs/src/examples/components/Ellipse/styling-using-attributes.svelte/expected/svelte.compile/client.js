import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Axis, Chart, Ellipse, Layer } from 'layerchart';

var root = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);

export default function Styling_using_attributes($$anchor) {
	Chart($$anchor, {
		xDomain: [0, 100],
		yDomain: [0, 100],
		padding: { top: 10, bottom: 20, left: 24, right: 10 },
		height: 300,
		children: ($$anchor, $$slotProps) => {
			Layer($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node = $.first_child(fragment_2);

					Axis(node, { placement: 'bottom', rule: true });

					var node_1 = $.sibling(node, 2);

					Axis(node_1, { placement: 'left', rule: true });

					var node_2 = $.sibling(node_1, 2);

					Ellipse(node_2, {
						cx: 100,
						cy: 100,
						rx: 20,
						ry: 10,
						fill: 'var(--color-surface-content)'
					});

					var node_3 = $.sibling(node_2, 2);

					Ellipse(node_3, {
						cx: 200,
						cy: 200,
						rx: 20,
						ry: 10,
						fill: 'var(--color-primary)'
					});

					var node_4 = $.sibling(node_3, 2);

					Ellipse(node_4, {
						cx: 200,
						cy: 50,
						rx: 20,
						ry: 10,
						fill: 'var(--color-secondary)'
					});

					var node_5 = $.sibling(node_4, 2);

					Ellipse(node_5, {
						cx: 300,
						cy: 150,
						rx: 20,
						ry: 10,
						stroke: 'var(--color-primary)',
						strokeWidth: 2,
						fill: 'var(--color-primary)',
						fillOpacity: 0.1
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}