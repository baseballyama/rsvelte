import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { CircleLegend } from 'layerchart';
import { scaleSqrt } from 'd3-scale';

var root = $.from_html(`<div class="grid gap-6"><!> <!> <!></div>`);

export default function Label_placement($$anchor, $$props) {
	$.push($$props, true);

	const scale = scaleSqrt([0, 1_000_000], [0, 50]);
	var div = root();
	var node = $.child(div);

	CircleLegend(node, {
		get scale() {
			return scale;
		},
		title: 'Population',
		tickFormat: 'metric',
		labelPlacement: 'right'
	});

	var node_1 = $.sibling(node, 2);

	CircleLegend(node_1, {
		get scale() {
			return scale;
		},
		title: 'Population',
		tickFormat: 'metric',
		labelPlacement: 'left'
	});

	var node_2 = $.sibling(node_1, 2);

	CircleLegend(node_2, {
		get scale() {
			return scale;
		},
		title: 'Population',
		tickFormat: 'metric',
		labelPlacement: 'inline'
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}