import * as $ from 'svelte/internal/server';
import { Chart, Spline } from 'layerchart';

export default function Data_mark_data($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
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
			function marks($$renderer) {
				Spline($$renderer, {
					x: 'date',
					y: 'value',
					data: temperatureData,
					stroke: 'var(--color-apples)'
				});

				$$renderer.push(`<!----> `);

				Spline($$renderer, {
					x: 'date',
					y: 'value',
					data: humidityData,
					stroke: 'var(--color-oranges)'
				});

				$$renderer.push(`<!---->`);
			}

			Chart($$renderer, { height: 300, marks, $$slots: { marks: true } });
		}
	});
}