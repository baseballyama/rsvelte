import * as $ from 'svelte/internal/server';
import { Legend } from 'layerchart';
import { scaleSequentialSqrt } from 'd3-scale';
import { interpolateTurbo } from 'd3-scale-chromatic';

export default function Sequential_sqrt($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<div class="grid gap-6">`);

		Legend($$renderer, {
			scale: scaleSequentialSqrt([0, 1], interpolateTurbo),
			title: 'Speed (kts)'
		});

		$$renderer.push(`<!----> `);

		Legend($$renderer, {
			scale: scaleSequentialSqrt([0, 1], interpolateTurbo),
			title: 'Speed (kts)',
			variant: 'swatches'
		});

		$$renderer.push(`<!----></div>`);
	});
}