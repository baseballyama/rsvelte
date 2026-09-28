import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Doughnut } from 'svelte-chartjs';

import {
	Chart as ChartJS,
	Title,
	Tooltip,
	Legend,
	ArcElement,
	CategoryScale
} from 'chart.js';

export default function DoughnutDemo($$anchor, $$props) {
	$.push($$props, true);
	ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale);

	const data = {
		labels: ['Red', 'Green', 'Yellow', 'Grey', 'Dark Grey'],
		datasets: [
			{
				data: [300, 50, 100, 40, 120],
				backgroundColor: ['#F7464A', '#46BFBD', '#FDB45C', '#949FB1', '#4D5360'],
				hoverBackgroundColor: ['#FF5A5E', '#5AD3D1', '#FFC870', '#A8B3C5', '#616774']
			}
		]
	};

	Doughnut($$anchor, {
		get data() {
			return data;
		},
		options: { responsive: true }
	});

	$.pop();
}