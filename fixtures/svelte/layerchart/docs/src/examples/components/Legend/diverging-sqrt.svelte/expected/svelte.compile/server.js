import * as $ from 'svelte/internal/server';
import { Legend } from 'layerchart';
import { scaleDivergingSqrt } from 'd3-scale';
import { interpolateRdBu } from 'd3-scale-chromatic';

export default function Diverging_sqrt($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<div class="grid gap-6 p-2">`);

		Legend($$renderer, {
			scale: scaleDivergingSqrt([-0.1, 0, 0.1], interpolateRdBu),
			title: 'Daily change',
			tickFormat: 'percentRound'
		});

		$$renderer.push(`<!----> `);

		Legend($$renderer, {
			scale: scaleDivergingSqrt([-0.1, 0, 0.1], interpolateRdBu),
			title: 'Daily change',
			tickFormat: 'percentRound',
			variant: 'swatches'
		});

		$$renderer.push(`<!----></div>`);
	});
}