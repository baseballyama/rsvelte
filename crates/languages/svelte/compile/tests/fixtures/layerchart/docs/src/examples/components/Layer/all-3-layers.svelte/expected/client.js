import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Chart, Layer, Circle, Arc } from 'layerchart';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function All_3_layers($$anchor) {
	Chart($$anchor, {
		height: 200,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node = $.first_child(fragment_1);

			Layer(node, {
				center: true,
				type: 'canvas',
				children: ($$anchor, $$slotProps) => {
					Circle($$anchor, { fill: '#F2D707', r: 100 });
				},
				$$slots: { default: true }
			});

			var node_1 = $.sibling(node, 2);

			Layer(node_1, {
				center: true,
				type: 'svg',
				children: ($$anchor, $$slotProps) => {
					var fragment_3 = root();
					var node_2 = $.first_child(fragment_3);

					Circle(node_2, { fill: 'black', r: 15, cx: -30, cy: -30 });

					var node_3 = $.sibling(node_2, 2);

					Arc(node_3, {
						value: 100,
						range: [-260, -100],
						cornerRadius: 25,
						innerRadius: 50,
						outerRadius: 65,
						fill: 'black'
					});

					$.append($$anchor, fragment_3);
				},
				$$slots: { default: true }
			});

			var node_4 = $.sibling(node_1, 2);

			Layer(node_4, {
				center: true,
				type: 'html',
				children: ($$anchor, $$slotProps) => {
					Circle($$anchor, { id: 'left-eye', fill: 'black', r: 15, cx: 30, cy: -30 });
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}