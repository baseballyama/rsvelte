import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Legend } from 'layerchart';
import { scaleOrdinal } from 'd3-scale';
import { schemeSpectral } from 'd3-scale-chromatic';

export default function Responsive_swatches($$anchor, $$props) {
	$.push($$props, true);

	{
		let $0 = $.derived(() => scaleOrdinal(
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
		));

		Legend($$anchor, {
			get scale() {
				return $.get($0);
			},
			title: 'Age (years)',
			variant: 'swatches',
			classes: { root: 'w-full', swatch: 'size-2', item: 'text-xs' }
		});
	}

	$.pop();
}