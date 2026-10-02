import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Axis, Chart, Line, Layer } from 'layerchart';

var root = $.from_html(`<!> <!> <!> <!> <!>`, 1);

export default function Styling_using_css_variables($$anchor) {
	Chart($$anchor, {
		xDomain: [0, 100],
		yDomain: [0, 100],
		padding: { top: 10, bottom: 20, left: 20, right: 10 },
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

					Line(node_2, {
						x1: 100,
						y1: 100,
						x2: 200,
						y2: 200,
						strokeWidth: 10,
						style: '--stroke-color:var(--color-primary)'
					});

					var node_3 = $.sibling(node_2, 2);

					Line(node_3, {
						x1: 50,
						y1: 150,
						x2: 400,
						y2: 150,
						strokeWidth: 2,
						style: '--stroke-color:var(--color-secondary)'
					});

					var node_4 = $.sibling(node_3, 2);

					Line(node_4, {
						x1: 50,
						y1: 10,
						x2: 400,
						y2: 50,
						strokeWidth: 2,
						style: '--stroke-color:var(--color-accent)',
						markerStart: 'circle',
						markerEnd: 'arrow'
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}