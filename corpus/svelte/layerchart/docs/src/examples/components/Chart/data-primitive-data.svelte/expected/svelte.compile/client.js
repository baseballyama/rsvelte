import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Chart, Circle, Spline } from 'layerchart';

var root = $.from_html(`<!> <!>`, 1);

export default function Data_primitive_data($$anchor, $$props) {
	$.push($$props, true);

	let temperatureData = [
		{ date: new Date(2020, 0, 1), value: 32 },
		{ date: new Date(2021, 0, 1), value: 35 },
		{ date: new Date(2022, 0, 1), value: 28 },
		{ date: new Date(2023, 0, 1), value: 40 },
		{ date: new Date(2024, 0, 1), value: 38 },
		{ date: new Date(2025, 0, 1), value: 30 }
	];

	let humidityData = [
		{ date: new Date(2020, 0, 1), value: 60 },
		{ date: new Date(2021, 0, 1), value: 55 },
		{ date: new Date(2022, 0, 1), value: 70 },
		{ date: new Date(2023, 0, 1), value: 65 },
		{ date: new Date(2024, 0, 1), value: 50 },
		{ date: new Date(2025, 0, 1), value: 68 }
	];

	{
		const marks = ($$anchor) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			Circle(node, {
				cx: 'date',
				cy: 'value',
				get data() {
					return temperatureData;
				},
				r: 5,
				fill: 'var(--color-apples)'
			});

			var node_1 = $.sibling(node, 2);

			Circle(node_1, {
				cx: 'date',
				cy: 'value',
				get data() {
					return humidityData;
				},
				r: 5,
				fill: 'var(--color-oranges)'
			});

			$.append($$anchor, fragment_1);
		};

		Chart($$anchor, { height: 300, marks, $$slots: { marks: true } });
	}

	$.pop();
}