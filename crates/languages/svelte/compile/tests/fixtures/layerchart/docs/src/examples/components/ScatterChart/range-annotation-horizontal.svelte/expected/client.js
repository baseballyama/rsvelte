import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ScatterChart } from 'layerchart';
import { getSpiral } from '$lib/utils/data.js';

export default function Range_annotation_horizontal($$anchor, $$props) {
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
		annotations: [
			{
				type: 'range',
				layer: 'below',
				y: [230, 270],
				label: 'Range',
				labelPlacement: 'bottom',
				labelYOffset: -16,
				pattern: { size: 8, lines: { rotate: -45, opacity: 0.3 } }
			}
		],
		padding: 24,
		height: 400
	});

	return $.pop($$exports);
}