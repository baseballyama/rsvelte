import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ScatterChart } from 'layerchart';
import { getSpiral } from '$lib/utils/data.js';

export default function Single_axis_y($$anchor, $$props) {
	$.push($$props, true);

	const data = getSpiral({
		angle: 137.5,
		radius: 10,
		count: 100,
		width: 500,
		height: 500
	});

	var $$exports = { data };

	ScatterChart($$anchor, {
		get data() {
			return data;
		},
		xNice: true,
		x: 'x',
		y: 'y',
		axis: 'y',
		padding: 24,
		height: 400
	});

	return $.pop($$exports);
}