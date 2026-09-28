import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

export default function Chart_1($$anchor, $$props) {
	$.push($$props, true);
	Chart.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

	Bar($$anchor, {
		get data() {
			return data;
		},
		options: { responsive: true }
	});

	$.pop();
}