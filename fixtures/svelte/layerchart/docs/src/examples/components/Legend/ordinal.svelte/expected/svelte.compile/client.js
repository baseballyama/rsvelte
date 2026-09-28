import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Legend } from 'layerchart';
import { scaleOrdinal } from 'd3-scale';
import { schemeSpectral } from 'd3-scale-chromatic';

var root = $.from_html(`<div class="grid gap-6"><!> <!></div>`);

export default function Ordinal($$anchor, $$props) {
	$.push($$props, true);

	var div = root();
	var node = $.child(div);

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

		Legend(node, {
			get scale() {
				return $.get($0);
			},
			title: 'Age (years)',
			variant: 'ramp',
			tickLength: 0
		});
	}

	var node_1 = $.sibling(node, 2);

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

		Legend(node_1, {
			get scale() {
				return $.get($0);
			},
			title: 'Age (years)',
			variant: 'swatches'
		});
	}

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}