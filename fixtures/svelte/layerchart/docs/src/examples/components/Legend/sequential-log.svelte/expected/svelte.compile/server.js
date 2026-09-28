import * as $ from 'svelte/internal/server';
import { Legend } from 'layerchart';
import { scaleSequentialLog } from 'd3-scale';
import { interpolateBlues } from 'd3-scale-chromatic';

export default function Sequential_log($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<div class="grid gap-6">`);

		Legend($$renderer, {
			scale: scaleSequentialLog([1, 100], interpolateBlues),
			title: 'Energy (joules)',
			ticks: 10
		});

		$$renderer.push(`<!----></div>`);
	});
}