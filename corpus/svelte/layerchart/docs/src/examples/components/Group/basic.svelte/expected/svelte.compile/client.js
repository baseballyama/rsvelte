import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Axis, Chart, Circle, Group, Text, Layer } from 'layerchart';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Basic($$anchor) {
	Chart($$anchor, {
		xDomain: [0, 100],
		yDomain: [0, 100],
		padding: { bottom: 20, left: 20 },
		height: 300,
		children: ($$anchor, $$slotProps) => {
			Layer($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root_1();
					var node = $.first_child(fragment_2);

					Axis(node, { placement: 'bottom', rule: true });

					var node_1 = $.sibling(node, 2);

					Axis(node_1, { placement: 'left', rule: true });

					var node_2 = $.sibling(node_1, 2);

					Group(node_2, {
						center: true,
						children: ($$anchor, $$slotProps) => {
							Circle($$anchor, { r: 20, class: 'fill-surface-content' });
						},
						$$slots: { default: true }
					});

					var node_3 = $.sibling(node_2, 2);

					Group(node_3, {
						x: 100,
						y: 100,
						children: ($$anchor, $$slotProps) => {
							var fragment_4 = root();
							var node_4 = $.first_child(fragment_4);

							Circle(node_4, { r: 10, class: 'fill-surface-content' });

							var node_5 = $.sibling(node_4, 2);

							Text(node_5, {
								value: 'point',
								textAnchor: 'middle',
								verticalAnchor: 'start',
								class: 'text-xs',
								dy: 12
							});

							$.append($$anchor, fragment_4);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}