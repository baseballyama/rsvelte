import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Chart, Circle, Text, Axis, Layer } from 'layerchart';

var root = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Data_mode($$anchor, $$props) {
	$.push($$props, true);

	const data = [
		{ date: new Date('2024-01-01'), value: 10, label: 'Jan' },
		{ date: new Date('2024-03-01'), value: 35, label: 'Mar' },
		{ date: new Date('2024-05-01'), value: 22, label: 'May' },
		{ date: new Date('2024-07-01'), value: 48, label: 'Jul' },
		{ date: new Date('2024-09-01'), value: 30, label: 'Sep' },
		{ date: new Date('2024-11-01'), value: 55, label: 'Nov' }
	];

	Chart($$anchor, {
		get data() {
			return data;
		},
		x: 'date',
		y: 'value',
		yNice: true,
		padding: { top: 30, bottom: 20, left: 24, right: 10 },
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

					Circle(node_2, { cx: 'date', cy: 'value', r: 4, class: 'fill-primary' });

					var node_3 = $.sibling(node_2, 2);

					Text(node_3, {
						x: 'date',
						y: 'value',
						value: 'label',
						textAnchor: 'middle',
						dy: -8,
						class: 'text-xs fill-surface-content'
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