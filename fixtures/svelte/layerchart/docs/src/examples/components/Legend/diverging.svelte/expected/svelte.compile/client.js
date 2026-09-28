import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Legend } from 'layerchart';
import { scaleDiverging } from 'd3-scale';
import { interpolatePiYG } from 'd3-scale-chromatic';

var root = $.from_html(`<div class="grid gap-6 p-2"><!> <!></div>`);

export default function Diverging($$anchor, $$props) {
	$.push($$props, true);

	var div = root();
	var node = $.child(div);

	{
		let $0 = $.derived(() => scaleDiverging([-0.1, 0, 0.1], interpolatePiYG));

		Legend(node, {
			get scale() {
				return $.get($0);
			},
			title: 'Daily change',
			tickFormat: 'percentRound'
		});
	}

	var node_1 = $.sibling(node, 2);

	{
		let $0 = $.derived(() => scaleDiverging([-0.1, 0, 0.1], interpolatePiYG));

		Legend(node_1, {
			get scale() {
				return $.get($0);
			},
			title: 'Daily change',
			tickFormat: 'percentRound',
			variant: 'swatches'
		});
	}

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}