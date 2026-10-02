import * as $ from 'svelte/internal/server';
import { Legend } from 'layerchart';
import { scaleQuantize } from 'd3-scale';
import { schemePurples } from 'd3-scale-chromatic';

export default function Quantize($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<div class="grid gap-6">`);

		Legend($$renderer, {
			scale: scaleQuantize([1, 10], schemePurples[9]),
			title: 'Unemployment rate (%)'
		});

		$$renderer.push(`<!----></div>`);
	});
}