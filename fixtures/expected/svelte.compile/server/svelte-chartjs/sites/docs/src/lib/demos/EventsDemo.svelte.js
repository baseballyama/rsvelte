import * as $ from 'svelte/internal/server';

import {
	Chart,
	getDatasetAtEvent,
	getElementAtEvent,
	getElementsAtEvent
} from 'svelte-chartjs';

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

export default function EventsDemo($$renderer, $$props) {
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
		let chart = null;
		let lastEvent = 'Click the chart to see event data';

		function onClick(event) {
			if (!chart) return;

			const dataset = getDatasetAtEvent(chart, event);
			const element = getElementAtEvent(chart, event);
			const elements = getElementsAtEvent(chart, event);

			if (element.length > 0) {
				const { datasetIndex, index } = element[0];

				lastEvent = `Clicked: ${data.labels[index]} — ${data.datasets[datasetIndex].label} (${elements.length} element(s) at index)`;
			}
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Chart($$renderer, {
				type: 'bar',
				onclick: onClick,
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

			$$renderer.push(`<!----> <p class="event-output svelte-rttpc5">${$.escape(lastEvent)}</p>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}