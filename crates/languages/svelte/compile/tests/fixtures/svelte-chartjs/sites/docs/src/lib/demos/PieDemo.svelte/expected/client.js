import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Pie } from 'svelte-chartjs';

import {
	Chart as ChartJS,
	Title,
	Tooltip,
	Legend,
	ArcElement,
	CategoryScale
} from 'chart.js';

export default function PieDemo($$anchor, $$props) {
	$.push($$props, true);
	ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale);

	const data = {
		labels: ['Red', 'Green', 'Yellow', 'Grey', 'Dark Grey'],
		datasets: [
			{
				data: [300, 50, 100, 40, 120],
				backgroundColor: [
					'#F7464A',
					'#46BFBD',
					'#FDB45C',
					'#949FB1',
					'#4D5360',
					'#AC64AD'
				],
				hoverBackgroundColor: [
					'#FF5A5E',
					'#5AD3D1',
					'#FFC870',
					'#A8B3C5',
					'#616774',
					'#DA92DB'
				]
			}
		]
	};

	Pie($$anchor, {
		get data() {
			return data;
		},
		options: { responsive: true }
	});

	$.pop();
}