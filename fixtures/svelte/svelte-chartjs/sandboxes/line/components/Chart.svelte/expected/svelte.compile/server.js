import * as $ from 'svelte/internal/server';
import { Line } from 'svelte-chartjs';
import { data } from './data.js';

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

export default function Chart($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		ChartJS.register(Title, Tooltip, Legend, LineElement, LinearScale, PointElement, CategoryScale);
		Line($$renderer, { data, options: { responsive: true } });
	});
}