import * as $ from 'svelte/internal/server';

import {
	Chart,
	getDatasetAtEvent,
	getElementAtEvent,
	getElementsAtEvent
} from 'svelte-chartjs';

import { data, options } from './data.js';

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

export default function Chart_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		ChartJS.register(LinearScale, CategoryScale, BarElement, PointElement, LineElement, Legend, Tooltip, LineController, BarController);

		function printDatasetAtEvent(dataset) {
			if (!dataset.length) return;

			const datasetIndex = dataset[0].datasetIndex;

			console.log(data.datasets[datasetIndex].label);
		}

		function printElementAtEvent(element) {
			if (!element.length) return;

			const { datasetIndex, index } = element[0];

			console.log(data.labels[index], data.datasets[datasetIndex].data[index]);
		}

		function printElementsAtEvent(elements) {
			if (!elements.length) return;

			console.log(elements.length);
		}

		let chart;

		function onClick(event) {
			if (!chart) {
				return;
			}

			printDatasetAtEvent(getDatasetAtEvent(chart, event));
			printElementAtEvent(getElementAtEvent(chart, event));
			printElementsAtEvent(getElementsAtEvent(chart, event));
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
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}