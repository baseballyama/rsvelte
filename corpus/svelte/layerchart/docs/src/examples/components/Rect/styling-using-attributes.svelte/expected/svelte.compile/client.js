import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Axis, Chart, Rect, Layer } from 'layerchart';

var root = $.from_html(`<!> <!> <!> <!> <!>`, 1);

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

					Rect(node_2, { x: 50, y: 50, width: 100, height: 150 });

					var node_3 = $.sibling(node_2, 2);

					Rect(node_3, {
						x: 90,
						y: 80,
						width: 200,
						height: 100,
						fill: 'var(--color-primary)'
					});

					var node_4 = $.sibling(node_3, 2);

					Rect(node_4, {
						x: 125,
						y: 40,
						width: 200,
						height: 100,
						strokeWidth: 1,
						fill: 'transparent',
						stroke: 'var(--color-primary)'
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}