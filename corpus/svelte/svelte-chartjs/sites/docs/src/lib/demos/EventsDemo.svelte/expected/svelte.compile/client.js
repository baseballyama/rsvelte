import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

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

var root = $.from_html(`<!> <p class="event-output svelte-rttpc5"> </p>`, 1);

export default function EventsDemo($$anchor, $$props) {
	$.push($$props, true);
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
	let chart = $.state(null);
	let lastEvent = $.state('Click the chart to see event data');

	function onClick(event) {
		if (!$.get(chart)) return;

		const dataset = getDatasetAtEvent($.get(chart), event);
		const element = getElementAtEvent($.get(chart), event);
		const elements = getElementsAtEvent($.get(chart), event);

		if (element.length > 0) {
			const { datasetIndex, index } = element[0];

			$.set(lastEvent, `Clicked: ${data.labels[index]} — ${data.datasets[datasetIndex].label} (${elements.length} element(s) at index)`);
		}
	}

	var fragment = root();
	var node = $.first_child(fragment);

	Chart(node, {
		type: 'bar',
		onclick: onClick,
		get data() {
			return data;
		},

		get options() {
			return options;
		},

		get chart() {
			return $.get(chart);
		},

		set chart($$value) {
			$.set(chart, $$value, true);
		}
	});

	var p = $.sibling(node, 2);
	var text = $.only_child(p, true);

	$.template_effect(() => $.set_text(text, $.get(lastEvent)));
	$.append($$anchor, fragment);
	$.pop();
}