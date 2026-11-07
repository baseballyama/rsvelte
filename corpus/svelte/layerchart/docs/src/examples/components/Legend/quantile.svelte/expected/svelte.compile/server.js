import * as $ from 'svelte/internal/server';
import { Legend } from 'layerchart';
import { scaleQuantile } from 'd3-scale';
import { schemeSpectral } from 'd3-scale-chromatic';
import { range } from 'd3-array';
import { randomNormal } from 'd3-random';

export default function Quantile($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const randomNormalData = range(1000).map(randomNormal(100, 20));

		$$renderer.push(`<div class="grid gap-6">`);

		Legend($$renderer, {
			scale: scaleQuantile(randomNormalData, schemeSpectral[9]),
			title: 'Height (cm)',
			tickFormat: 'integer'
		});

		$$renderer.push(`<!----></div>`);
	});
}