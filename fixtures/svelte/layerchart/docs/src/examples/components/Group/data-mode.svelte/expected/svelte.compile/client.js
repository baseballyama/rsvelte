import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Chart, Circle, Group, Text, Axis, Layer } from 'layerchart';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

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
					var fragment_2 = root_1();
					var node = $.first_child(fragment_2);

					Axis(node, { placement: 'bottom', rule: true });

					var node_1 = $.sibling(node, 2);

					Axis(node_1, { placement: 'left', rule: true });

					var node_2 = $.sibling(node_1, 2);

					Group(node_2, {
						x: 'date',
						y: 'value',
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root();
							var node_3 = $.first_child(fragment_3);

							Circle(node_3, { r: 4, class: 'fill-primary' });

							var node_4 = $.sibling(node_3, 2);

							Text(node_4, {
								value: 'label',
								textAnchor: 'middle',
								dy: -8,
								class: 'text-xs fill-surface-content'
							});

							$.append($$anchor, fragment_3);
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

	$.pop();
}