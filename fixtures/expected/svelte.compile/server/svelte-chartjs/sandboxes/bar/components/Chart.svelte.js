import * as $ from 'svelte/internal/server';
import { Bar } from 'svelte-chartjs';
import { data } from './data.js';

import {
	Chart,
	Title,
	Tooltip,
	Legend,
	BarElement,
	CategoryScale,
	LinearScale
} from 'chart.js';

export default function Chart_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		Chart.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);
		Bar($$renderer, { data, options: { responsive: true } });
	});
}