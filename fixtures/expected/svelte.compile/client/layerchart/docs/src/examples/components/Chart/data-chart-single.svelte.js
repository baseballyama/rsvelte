import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Chart, Spline } from 'layerchart';

export default function Data_chart_single($$anchor, $$props) {
	$.push($$props, true);

	let data = [
		{ date: new Date(2020, 0, 1), value: 20 },
		{ date: new Date(2021, 0, 1), value: 30 },
		{ date: new Date(2022, 0, 1), value: 18 },
		{ date: new Date(2023, 0, 1), value: 55 },
		{ date: new Date(2024, 0, 1), value: 20 },
		{ date: new Date(2025, 0, 1), value: 10 }
	];

	{
		const marks = ($$anchor) => {
			Spline($$anchor, {});
		};

		Chart($$anchor, {
			get data() {
				return data;
			},
			x: 'date',
			y: 'value',
			height: 300,
			marks,
			$$slots: { marks: true }
		});
	}

	$.pop();
}