import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Chart, Spline } from 'layerchart';

var root = $.from_html(`<!> <!>`, 1);

export default function Data_chart_multi($$anchor, $$props) {
	$.push($$props, true);

	let data = [
		{ date: new Date(2020, 0, 1), apples: 20, oranges: 15 },
		{ date: new Date(2021, 0, 1), apples: 30, oranges: 25 },
		{ date: new Date(2022, 0, 1), apples: 18, oranges: 28 },
		{ date: new Date(2023, 0, 1), apples: 55, oranges: 40 },
		{ date: new Date(2024, 0, 1), apples: 20, oranges: 22 },
		{ date: new Date(2025, 0, 1), apples: 10, oranges: 12 }
	];

	{
		const marks = ($$anchor) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			Spline(node, { y: 'apples', stroke: 'var(--color-apples)' });

			var node_1 = $.sibling(node, 2);

			Spline(node_1, { y: 'oranges', stroke: 'var(--color-oranges)' });
			$.append($$anchor, fragment_1);
		};

		Chart($$anchor, {
			get data() {
				return data;
			},
			x: 'date',
			height: 300,
			marks,
			$$slots: { marks: true }
		});
	}

	$.pop();
}