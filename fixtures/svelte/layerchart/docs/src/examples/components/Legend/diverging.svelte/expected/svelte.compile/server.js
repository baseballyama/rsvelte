import * as $ from 'svelte/internal/server';
import { Legend } from 'layerchart';
import { scaleDiverging } from 'd3-scale';
import { interpolatePiYG } from 'd3-scale-chromatic';

export default function Diverging($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<div class="grid gap-6 p-2">`);

		Legend($$renderer, {
			scale: scaleDiverging([-0.1, 0, 0.1], interpolatePiYG),
			title: 'Daily change',
			tickFormat: 'percentRound'
		});

		$$renderer.push(`<!----> `);

		Legend($$renderer, {
			scale: scaleDiverging([-0.1, 0, 0.1], interpolatePiYG),
			title: 'Daily change',
			tickFormat: 'percentRound',
			variant: 'swatches'
		});

		$$renderer.push(`<!----></div>`);
	});
}