import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { CircleLegend } from 'layerchart';
import { scaleLinear, scaleSqrt, scaleLog, scalePow } from 'd3-scale';

var root = $.from_html(`<div class="flex flex-wrap gap-4"><!> <!> <!> <!></div>`);

export default function Scale_types($$anchor, $$props) {
	$.push($$props, true);

	const linear = scaleLinear([0, 1_000_000], [0, 50]);
	const sqrt = scaleSqrt([0, 1_000_000], [0, 50]);
	const log = scaleLog([1, 1_000_000], [4, 50]);
	const pow = scalePow().exponent(0.3).domain([0, 1_000_000]).range([0, 50]);
	var div = root();
	var node = $.child(div);

	CircleLegend(node, {
		get scale() {
			return sqrt;
		},
		title: 'Sqrt',
		tickFormat: 'metric'
	});

	var node_1 = $.sibling(node, 2);

	CircleLegend(node_1, {
		get scale() {
			return linear;
		},
		title: 'Linear',
		tickFormat: 'metric'
	});

	var node_2 = $.sibling(node_1, 2);

	CircleLegend(node_2, {
		get scale() {
			return log;
		},
		title: 'Log',
		tickFormat: 'metric'
	});

	var node_3 = $.sibling(node_2, 2);

	CircleLegend(node_3, {
		get scale() {
			return pow;
		},
		title: 'Pow (0.3)',
		tickFormat: 'metric'
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}