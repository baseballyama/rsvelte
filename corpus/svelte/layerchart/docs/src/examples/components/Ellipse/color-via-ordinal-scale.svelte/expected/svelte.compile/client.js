import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Chart, Ellipse, Axis, Layer } from 'layerchart';

var root = $.from_html(`<!> <!> <!>`, 1);

export default function Color_via_ordinal_scale($$anchor, $$props) {
	$.push($$props, true);

	const data = [
		{ date: new Date('2024-01-01'), value: 10, category: 'A' },
		{ date: new Date('2024-02-01'), value: 35, category: 'B' },
		{ date: new Date('2024-03-01'), value: 22, category: 'A' },
		{ date: new Date('2024-04-01'), value: 48, category: 'B' },
		{ date: new Date('2024-05-01'), value: 30, category: 'A' },
		{ date: new Date('2024-06-01'), value: 55, category: 'B' },
		{ date: new Date('2024-07-01'), value: 42, category: 'A' },
		{ date: new Date('2024-08-01'), value: 68, category: 'B' }
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

					Ellipse(node_2, { cx: 'date', cy: 'value', rx: 12, ry: 6, fill: 'category' });
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.pop();
}