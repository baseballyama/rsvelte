import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Line } from 'svelte-chartjs';

import {
	Chart as ChartJS,
	Title,
	Tooltip,
	Legend,
	LineElement,
	LinearScale,
	PointElement,
	CategoryScale
} from 'chart.js';

var root = $.from_html(`<div class="controls svelte-13cablb"><button class="svelte-13cablb">Add Data</button> <button class="svelte-13cablb">Remove Data</button> <button class="svelte-13cablb">Randomize</button> <button class="svelte-13cablb">Add Dataset</button> <button class="svelte-13cablb">Remove Dataset</button></div> <!>`, 1);

export default function ReactiveDemo($$anchor, $$props) {
	$.push($$props, true);
	ChartJS.register(Title, Tooltip, Legend, LineElement, LinearScale, PointElement, CategoryScale);

	const COLORS = [
		'rgb(255, 99, 132)',
		'rgb(75, 192, 192)',
		'rgb(53, 162, 235)',
		'rgb(255, 205, 86)',
		'rgb(153, 102, 255)'
	];

	let nextLabel = $.state(7);

	let data = $.state($.proxy({
		labels: ['1', '2', '3', '4', '5', '6'],
		datasets: [
			{
				label: 'Dataset 1',
				data: [65, 59, 80, 81, 56, 55],
				borderColor: COLORS[0],
				backgroundColor: COLORS[0],
				tension: 0.3
			}
		]
	}));

	function randomValue() {
		return Math.floor(Math.random() * 100);
	}

	function addDataPoint() {
		$.set(
			data,
			{
				...$.get(data),
				labels: [...$.get(data).labels, String($.get(nextLabel))],
				datasets: $.get(data).datasets.map((ds) => ({ ...ds, data: [...ds.data, randomValue()] }))
			},
			true
		);

		$.update(nextLabel);
	}

	function removeDataPoint() {
		if ($.get(data).labels.length <= 1) return;

		$.set(
			data,
			{
				...$.get(data),
				labels: $.get(data).labels.slice(0, -1),
				datasets: $.get(data).datasets.map((ds) => ({ ...ds, data: ds.data.slice(0, -1) }))
			},
			true
		);
	}

	function randomizeData() {
		$.set(
			data,
			{
				...$.get(data),
				datasets: $.get(data).datasets.map((ds) => ({ ...ds, data: ds.data.map(() => randomValue()) }))
			},
			true
		);
	}

	function addDataset() {
		const colorIndex = $.get(data).datasets.length % COLORS.length;

		$.set(
			data,
			{
				...$.get(data),
				datasets: [
					...$.get(data).datasets,
					{
						label: `Dataset ${$.get(data).datasets.length + 1}`,
						data: $.get(data).labels.map(() => randomValue()),
						borderColor: COLORS[colorIndex],
						backgroundColor: COLORS[colorIndex],
						tension: 0.3
					}
				]
			},
			true
		);
	}

	function removeDataset() {
		if ($.get(data).datasets.length <= 1) return;

		$.set(data, { ...$.get(data), datasets: $.get(data).datasets.slice(0, -1) }, true);
	}

	const options = {
		responsive: true,
		plugins: { title: { display: true, text: 'Reactive Data Demo' } },
		scales: { y: { beginAtZero: true } }
	};

	var fragment = root();
	var div = $.first_child(fragment);
	var button = $.child(div);
	var button_1 = $.sibling(button, 2);
	var button_2 = $.sibling(button_1, 2);
	var button_3 = $.sibling(button_2, 2);
	var button_4 = $.sibling(button_3, 2);

	$.reset(div);

	var node = $.sibling(div, 2);

	Line(node, {
		get data() {
			return $.get(data);
		},

		get options() {
			return options;
		}
	});

	$.delegated('click', button, addDataPoint);
	$.delegated('click', button_1, removeDataPoint);
	$.delegated('click', button_2, randomizeData);
	$.delegated('click', button_3, addDataset);
	$.delegated('click', button_4, removeDataset);
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);