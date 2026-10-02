import * as $ from 'svelte/internal/server';
import { Bubble } from 'svelte-chartjs';
import { data } from './data.js';

import {
	Chart as ChartJS,
	Title,
	Tooltip,
	Legend,
	PointElement,
	LinearScale
} from 'chart.js';

export default function Chart($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		ChartJS.register(Title, Tooltip, Legend, PointElement, LinearScale);
		Bubble($$renderer, { data, options: { responsive: true } });
	});
}