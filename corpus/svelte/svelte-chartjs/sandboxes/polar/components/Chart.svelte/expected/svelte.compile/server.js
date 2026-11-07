import * as $ from 'svelte/internal/server';
import { PolarArea } from 'svelte-chartjs';
import { data } from './data.js';

import {
	Chart as ChartJS,
	Title,
	Tooltip,
	Legend,
	ArcElement,
	RadialLinearScale
} from 'chart.js';

export default function Chart($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		ChartJS.register(Title, Tooltip, Legend, ArcElement, RadialLinearScale);
		PolarArea($$renderer, { data, options: { responsive: true } });
	});
}