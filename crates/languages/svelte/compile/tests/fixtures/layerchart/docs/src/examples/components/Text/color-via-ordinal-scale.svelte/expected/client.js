import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Chart, Circle, Text, Axis, Layer } from 'layerchart';

var root = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Color_via_ordinal_scale($$anchor, $$props) {
	$.push($$props, true);

	const data = [
		{
			date: new Date('2024-01-01'),
			value: 10,
			label: 'Jan',
			category: 'A'
		},

		{
			date: new Date('2024-03-01'),
			value: 35,
			label: 'Mar',
			category: 'B'
		},

		{
			date: new Date('2024-05-01'),
			value: 22,
			label: 'May',
			category: 'A'
		},

		{
			date: new Date('2024-07-01'),
			value: 48,
			label: 'Jul',
			category: 'B'
		},

		{
			date: new Date('2024-09-01'),
			value: 30,
			label: 'Sep',
			category: 'A'
		},

		{
			date: new Date('2024-11-01'),
			value: 55,
			label: 'Nov',
			category: 'B'
		}
	];

	Chart($$anchor, {
		get data() {
			return data;
		},
		x: 'date',
		y: 'value',
		yNice: true,
		c: 'category',
		cRange: ['var(--color-primary)', 'var(--color-secondary)'],
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

					Circle(node_2, { cx: 'date', cy: 'value', r: 4, fill: 'category' });

					var node_3 = $.sibling(node_2, 2);

					Text(node_3, {
						x: 'date',
						y: 'value',
						value: 'label',
						textAnchor: 'middle',
						dy: -8,
						fill: 'category',
						class: 'text-xs'
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