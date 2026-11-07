import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Bar } from 'svelte-chartjs';

import {
	Chart as ChartJS,
	Title,
	Tooltip,
	Legend,
	BarElement,
	CategoryScale,
	LinearScale
} from 'chart.js';

export default function HorizontalBarDemo($$anchor, $$props) {
	$.push($$props, true);
	ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

	const data = {
		labels: [
			'January',
			'February',
			'March',
			'April',
			'May',
			'June',
			'July'
		],
		datasets: [
			{
				label: 'Dataset 1',
				data: [65, 59, 80, 81, 56, 55, 40],
				backgroundColor: 'rgba(255, 99, 132, 0.5)',
				borderColor: 'rgb(255, 99, 132)',
				borderWidth: 1
			},

			{
				label: 'Dataset 2',
				data: [28, 48, 40, 19, 86, 27, 90],
				backgroundColor: 'rgba(53, 162, 235, 0.5)',
				borderColor: 'rgb(53, 162, 235)',
				borderWidth: 1
			}
		]
	};

	const options = {
		indexAxis: 'y',
		responsive: true,
		plugins: {
			legend: { position: 'top' },
			title: { display: true, text: 'Horizontal Bar Chart' }
		}
	};

	Bar($$anchor, {
		get data() {
			return data;
		},

		get options() {
			return options;
		}
	});

	$.pop();
}