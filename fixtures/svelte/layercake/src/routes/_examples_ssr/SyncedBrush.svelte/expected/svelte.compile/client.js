import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import SyncedBrushWrapper from '../../_components/SyncedBrushWrapper.percent-range.svelte';
import pointsOne from '../../_data/points.csv';
import pointsTwo from '../../_data/pointsTwo.csv';
import pointsThree from '../../_data/pointsThree.csv';
import pointsFour from '../../_data/pointsFour.csv';

var root = $.from_html(`<div class="small-multiple-container svelte-b62oy2"></div>`);

export default function SyncedBrush($$anchor) {
	// This example loads csv data as json and converts numeric columns to numbers using @rollup/plugin-dsv. See vite.config.js for details
	let brushExtents = $.proxy([null, null]);

	const xKey = 'myX';
	const yKey = 'myY';
	const datasets = [pointsOne, pointsTwo, pointsThree, pointsFour];

	datasets.forEach((dataset) => {
		dataset.forEach((d) => {
			d[yKey] = +d[yKey];
		});
	});

	const colors = ['#00e047', '#00bbff', '#ff00cc', '#ffcc00'];
	var div = root();

	$.each(div, 21, () => datasets, $.index, ($$anchor, dataset, i) => {
		SyncedBrushWrapper($$anchor, {
			get data() {
				return $.get(dataset);
			},
			xKey,
			yKey,
			get stroke() {
				return colors[i];
			},

			get min() {
				return brushExtents[0];
			},

			set min($$value) {
				brushExtents[0] = $$value;
			},

			get max() {
				return brushExtents[1];
			},

			set max($$value) {
				brushExtents[1] = $$value;
			}
		});
	});

	$.reset(div);
	$.append($$anchor, div);
}