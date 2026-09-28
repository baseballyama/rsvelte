import * as $ from 'svelte/internal/server';
import { Radar } from 'svelte-chartjs';
import { data } from './data.js';

import {
	Chart as ChartJS,
	Title,
	Tooltip,
	Legend,
	PointElement,
	RadialLinearScale,
	LineElement
} from 'chart.js';

export default function Chart($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		ChartJS.register(Title, Tooltip, Legend, PointElement, RadialLinearScale, LineElement);
		Radar($$renderer, { data, options: { responsive: true } });
	});
}