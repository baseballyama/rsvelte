import * as $ from 'svelte/internal/server';
import { Legend } from 'layerchart';
import { scaleSequential } from 'd3-scale';
import { interpolateViridis } from 'd3-scale-chromatic';

export default function Sequential($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<div class="grid gap-6">`);

		Legend($$renderer, {
			scale: scaleSequential([0, 100], interpolateViridis),
			title: 'Temperature (°F)'
		});

		$$renderer.push(`<!----> `);

		Legend($$renderer, {
			scale: scaleSequential([0, 100], interpolateViridis),
			title: 'Temperature (°F)',
			variant: 'swatches'
		});

		$$renderer.push(`<!----></div>`);
	});
}