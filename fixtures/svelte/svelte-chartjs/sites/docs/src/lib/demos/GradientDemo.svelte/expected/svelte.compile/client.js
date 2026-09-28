import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';
import { Line } from 'svelte-chartjs';

import {
	Chart as ChartJS,
	Title,
	Tooltip,
	Legend,
	LineElement,
	LinearScale,
	PointElement,
	CategoryScale,
	Filler
} from 'chart.js';

export default function GradientDemo($$anchor, $$props) {
	$.push($$props, true);
	ChartJS.register(Title, Tooltip, Legend, LineElement, LinearScale, PointElement, CategoryScale, Filler);

	let chart = $.state(null);

	const labels = [
		'January',
		'February',
		'March',
		'April',
		'May',
		'June',
		'July'
	];

	let data = $.state($.proxy({
		labels,
		datasets: [
			{
				label: 'Sales',
				data: [65, 59, 80, 81, 56, 55, 40],
				fill: true,
				borderColor: 'rgb(75, 192, 192)',
				backgroundColor: 'rgba(75, 192, 192, 0.2)',
				tension: 0.4
			}
		]
	}));

	onMount(() => {
		if (!$.get(chart)) return;

		const ctx = $.get(chart).ctx;
		const gradient = ctx.createLinearGradient(0, 0, 0, $.get(chart).chartArea.bottom);

		gradient.addColorStop(0, 'rgba(75, 192, 192, 0.6)');
		gradient.addColorStop(1, 'rgba(75, 192, 192, 0.0)');

		$.set(
			data,
			{
				...$.get(data),
				datasets: [{ ...$.get(data).datasets[0], backgroundColor: gradient }]
			},
			true
		);
	});

	Line($$anchor, {
		get data() {
			return $.get(data);
		},

		options: {
			responsive: true,
			plugins: { title: { display: true, text: 'Gradient Fill' } }
		},

		get chart() {
			return $.get(chart);
		},

		set chart($$value) {
			$.set(chart, $$value, true);
		}
	});

	$.pop();
}