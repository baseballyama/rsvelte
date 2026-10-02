import * as $ from 'svelte/internal/server';
import SyncedBrushWrapper from '../../_components/SyncedBrushWrapper.svelte';
import pointsOne from '../../_data/points.csv';
import pointsTwo from '../../_data/pointsTwo.csv';
import pointsThree from '../../_data/pointsThree.csv';
import pointsFour from '../../_data/pointsFour.csv';

export default function SyncedBrush($$renderer) {
	// This example loads csv data as json and converts numeric columns to numbers using @rollup/plugin-dsv. See vite.config.js for details
	let brushExtents = [null, null];

	const xKey = 'myX';
	const yKey = 'myY';
	const datasets = [pointsOne, pointsTwo, pointsThree, pointsFour];

	datasets.forEach((dataset) => {
		dataset.forEach((d) => {
			d[yKey] = +d[yKey];
		});
	});

	const colors = ['#00e047', '#00bbff', '#ff00cc', '#ffcc00'];
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div class="chart-container svelte-xvdr7d"><!--[-->`);

		const each_array = $.ensure_array_like(datasets);

		for (let i = 0, $$length = each_array.length; i < $$length; i++) {
			let dataset = each_array[i];

			SyncedBrushWrapper($$renderer, {
				data: dataset,
				xKey,
				yKey,
				stroke: colors[i],
				get min() {
					return brushExtents[0];
				},

				set min($$value) {
					brushExtents[0] = $$value;
					$$settled = false;
				},

				get max() {
					return brushExtents[1];
				},

				set max($$value) {
					brushExtents[1] = $$value;
					$$settled = false;
				}
			});
		}

		$$renderer.push(`<!--]--></div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}