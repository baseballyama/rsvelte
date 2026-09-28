import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Legend } from 'layerchart';
import { scaleQuantile } from 'd3-scale';
import { schemeSpectral } from 'd3-scale-chromatic';
import { range } from 'd3-array';
import { randomNormal } from 'd3-random';

var root = $.from_html(`<div class="grid gap-6"><!></div>`);

export default function Quantile($$anchor, $$props) {
	$.push($$props, true);

	const randomNormalData = range(1000).map(randomNormal(100, 20));
	var div = root();
	var node = $.child(div);

	{
		let $0 = $.derived(() => scaleQuantile(randomNormalData, schemeSpectral[9]));

		Legend(node, {
			get scale() {
				return $.get($0);
			},
			title: 'Height (cm)',
			tickFormat: 'integer'
		});
	}

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}