import * as $ from 'svelte/internal/server';
import { Doughnut } from 'svelte-chartjs';
import { data } from './data.js';

import {
	Chart as ChartJS,
	Title,
	Tooltip,
	Legend,
	ArcElement,
	CategoryScale
} from 'chart.js';

export default function Chart($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale);
		Doughnut($$renderer, { data, options: { responsive: true } });
	});
}