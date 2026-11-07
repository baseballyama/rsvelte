import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';
import { Chart } from 'svelte-chartjs';

import {
	Chart as ChartJS,
	Tooltip,
	Legend,
	BarElement,
	PointElement,
	LineElement,
	CategoryScale,
	LinearScale,
	LineController,
	BarController
} from 'chart.js';

export default function RefDemo($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		ChartJS.register(LinearScale, CategoryScale, BarElement, PointElement, LineElement, Legend, Tooltip, LineController, BarController);

		const labels = [
			'January',
			'February',
			'March',
			'April',
			'May',
			'June',
			'July'
		];

		const data = {
			labels,
			datasets: [
				{
					type: 'line',
					label: 'Dataset 1',
					borderColor: 'rgb(255, 99, 132)',
					borderWidth: 2,
					fill: false,
					data: labels.map(() => Math.random() * 1000)
				},

				{
					type: 'bar',
					label: 'Dataset 2',
					backgroundColor: 'rgb(75, 192, 192)',
					data: labels.map(() => Math.random() * 1000),
					borderColor: 'white',
					borderWidth: 2
				},

				{
					type: 'bar',
					label: 'Dataset 3',
					backgroundColor: 'rgb(53, 162, 235)',
					data: labels.map(() => Math.random() * 1000)
				}
			]
		};

		const options = { scales: { y: { beginAtZero: true } } };

		function triggerTooltip(chart) {
			const tooltip = chart && chart.tooltip;

			if (!tooltip) return;

			if (tooltip.getActiveElements().length > 0) {
				tooltip.setActiveElements([], { x: 0, y: 0 });
			} else {
				const { chartArea } = chart;

				tooltip.setActiveElements([{ datasetIndex: 0, index: 2 }, { datasetIndex: 1, index: 2 }], {
					x: (chartArea.left + chartArea.right) / 2,
					y: (chartArea.top + chartArea.bottom) / 2
				});
			}

			chart.update();
		}

		let chart = null;

		onMount(() => {
			triggerTooltip(chart);
		});

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Chart($$renderer, {
				type: 'bar',
				data,
				options,
				get chart() {
					return chart;
				},

				set chart($$value) {
					chart = $$value;
					$$settled = false;
				}
			});
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}