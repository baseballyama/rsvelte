import * as $ from 'svelte/internal/server';
import { Legend } from 'layerchart';
import { scaleThreshold } from 'd3-scale';
import { schemeRdBu } from 'd3-scale-chromatic';

export default function Threshold($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<div class="grid gap-6">`);

		Legend($$renderer, {
			scale: scaleThreshold([2.5, 3.1, 3.5, 3.9, 6, 7, 8, 9.5], schemeRdBu[9]),
			title: 'Unemployment rate (%)',
			tickLength: 0
		});

		$$renderer.push(`<!----></div>`);
	});
}