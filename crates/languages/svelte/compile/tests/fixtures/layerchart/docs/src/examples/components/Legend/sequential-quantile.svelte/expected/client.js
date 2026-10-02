import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Legend } from 'layerchart';
import { range } from 'd3-array';
import { scaleSequentialQuantile } from 'd3-scale';
import { interpolateBlues } from 'd3-scale-chromatic';

var root = $.from_html(`<div class="grid gap-6"><!> <!></div>`);

export default function Sequential_quantile($$anchor, $$props) {
	$.push($$props, true);

	const randomExponentialData = range(100).map(() => Math.random() ** 2);
	var div = root();
	var node = $.child(div);

	{
		let $0 = $.derived(() => scaleSequentialQuantile(randomExponentialData, interpolateBlues));

		Legend(node, {
			get scale() {
				return $.get($0);
			},
			title: 'Quantile',
			tickFormat: 'decimal'
		});
	}

	var node_1 = $.sibling(node, 2);

	{
		let $0 = $.derived(() => scaleSequentialQuantile(randomExponentialData, interpolateBlues));

		Legend(node_1, {
			get scale() {
				return $.get($0);
			},
			title: 'Quantile',
			tickFormat: 'decimal',
			variant: 'swatches'
		});
	}

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}