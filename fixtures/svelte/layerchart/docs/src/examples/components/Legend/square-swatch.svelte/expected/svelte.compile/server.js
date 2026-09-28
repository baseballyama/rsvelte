import * as $ from 'svelte/internal/server';
import { Legend } from 'layerchart';
import { scaleOrdinal } from 'd3-scale';
import { schemeSpectral } from 'd3-scale-chromatic';

export default function Square_swatch($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<div class="grid gap-6">`);

		Legend($$renderer, {
			scale: scaleOrdinal(
				[
					'<10',
					'10-19',
					'20-29',
					'30-39',
					'40-49',
					'50-59',
					'60-69',
					'70-79',
					'≥80'
				],
				schemeSpectral[10]
			),
			title: 'Age (years)',
			variant: 'swatches',
			classes: { swatch: 'rounded-sm' }
		});

		$$renderer.push(`<!----></div>`);
	});
}