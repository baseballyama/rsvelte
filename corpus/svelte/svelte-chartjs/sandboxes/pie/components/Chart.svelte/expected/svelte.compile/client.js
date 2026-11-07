import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Pie } from 'svelte-chartjs';
import { data } from './data.js';

import {
	Chart as ChartJS,
	Title,
	Tooltip,
	Legend,
	ArcElement,
	CategoryScale
} from 'chart.js';

export default function Chart($$anchor, $$props) {
	$.push($$props, true);
	ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale);

	Pie($$anchor, {
		get data() {
			return data;
		},
		options: { responsive: true }
	});

	$.pop();
}