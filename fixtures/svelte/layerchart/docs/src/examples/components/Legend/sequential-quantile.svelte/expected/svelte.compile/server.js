import * as $ from 'svelte/internal/server';
import { Legend } from 'layerchart';
import { range } from 'd3-array';
import { scaleSequentialQuantile } from 'd3-scale';
import { interpolateBlues } from 'd3-scale-chromatic';

export default function Sequential_quantile($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const randomExponentialData = range(100).map(() => Math.random() ** 2);

		$$renderer.push(`<div class="grid gap-6">`);

		Legend($$renderer, {
			scale: scaleSequentialQuantile(randomExponentialData, interpolateBlues),
			title: 'Quantile',
			tickFormat: 'decimal'
		});

		$$renderer.push(`<!----> `);

		Legend($$renderer, {
			scale: scaleSequentialQuantile(randomExponentialData, interpolateBlues),
			title: 'Quantile',
			tickFormat: 'decimal',
			variant: 'swatches'
		});

		$$renderer.push(`<!----></div>`);
	});
}