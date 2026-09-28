import * as $ from 'svelte/internal/server';
import { Scatter } from 'svelte-chartjs';
import { data } from './data.js';

import {
	Chart as ChartJS,
	Title,
	Tooltip,
	Legend,
	LineElement,
	CategoryScale,
	LinearScale,
	PointElement
} from 'chart.js';

export default function Chart($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		ChartJS.register(Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement);
		Scatter($$renderer, { data, options: { responsive: true } });
	});
}