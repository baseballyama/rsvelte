import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Chart, Polygon, Axis, Layer } from 'layerchart';

var root = $.from_html(`<!> <!> <!>`, 1);

export default function Data_mode($$anchor, $$props) {
	$.push($$props, true);

	const data = [
		{ date: new Date('2024-01-01'), value: 10 },
		{ date: new Date('2024-03-01'), value: 35 },
		{ date: new Date('2024-05-01'), value: 22 },
		{ date: new Date('2024-07-01'), value: 48 },
		{ date: new Date('2024-09-01'), value: 30 },
		{ date: new Date('2024-11-01'), value: 55 }
	];

	Chart($$anchor, {
		get data() {
			return data;
		},
		x: 'date',
		y: 'value',
		yNice: true,
		padding: { top: 20, bottom: 20, left: 24, right: 10 },
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

					Polygon(node_2, {
						cx: 'date',
						cy: 'value',
						r: 8,
						points: 6,
						class: 'fill-primary'
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