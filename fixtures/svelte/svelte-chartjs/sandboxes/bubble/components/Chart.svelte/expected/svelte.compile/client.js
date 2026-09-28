import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

export default function Chart($$anchor, $$props) {
	$.push($$props, true);
	ChartJS.register(Title, Tooltip, Legend, PointElement, LinearScale);

	Bubble($$anchor, {
		get data() {
			return data;
		},
		options: { responsive: true }
	});

	$.pop();
}