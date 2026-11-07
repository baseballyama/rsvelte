import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Chart, Spline } from 'layerchart';

var root = $.from_html(`<!> <!>`, 1);

export default function Data_series_separate_data($$anchor, $$props) {
	$.push($$props, true);

	let appleData = [
		{ date: new Date(2020, 0, 1), value: 20 },
		{ date: new Date(2021, 0, 1), value: 30 },
		{ date: new Date(2022, 0, 1), value: 18 },
		{ date: new Date(2023, 0, 1), value: 55 },
		{ date: new Date(2024, 0, 1), value: 20 },
		{ date: new Date(2025, 0, 1), value: 10 }
	];

	let orangeData = [
		{ date: new Date(2020, 0, 1), value: 15 },
		{ date: new Date(2021, 0, 1), value: 25 },
		{ date: new Date(2022, 0, 1), value: 28 },
		{ date: new Date(2023, 0, 1), value: 40 },
		{ date: new Date(2024, 0, 1), value: 22 },
		{ date: new Date(2025, 0, 1), value: 12 }
	];

	{
		const marks = ($$anchor) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			Spline(node, { seriesKey: 'apples', stroke: 'var(--color-apples)' });

			var node_1 = $.sibling(node, 2);

			Spline(node_1, { seriesKey: 'oranges', stroke: 'var(--color-oranges)' });
			$.append($$anchor, fragment_1);
		};

		let $0 = $.derived(() => [
			{ key: 'apples', data: appleData, color: 'var(--color-apples)' },
			{
				key: 'oranges',
				data: orangeData,
				color: 'var(--color-oranges)'
			}
		]);

		Chart($$anchor, {
			x: 'date',
			y: 'value',
			get series() {
				return $.get($0);
			},
			height: 300,
			marks,
			$$slots: { marks: true }
		});
	}

	$.pop();
}