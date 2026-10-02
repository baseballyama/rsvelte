import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Legend } from 'layerchart';
import { scaleSequentialSqrt } from 'd3-scale';
import { interpolateTurbo } from 'd3-scale-chromatic';

var root = $.from_html(`<div class="grid gap-6"><!> <!></div>`);

export default function Sequential_sqrt($$anchor, $$props) {
	$.push($$props, true);

	var div = root();
	var node = $.child(div);

	{
		let $0 = $.derived(() => scaleSequentialSqrt([0, 1], interpolateTurbo));

		Legend(node, {
			get scale() {
				return $.get($0);
			},
			title: 'Speed (kts)'
		});
	}

	var node_1 = $.sibling(node, 2);

	{
		let $0 = $.derived(() => scaleSequentialSqrt([0, 1], interpolateTurbo));

		Legend(node_1, {
			get scale() {
				return $.get($0);
			},
			title: 'Speed (kts)',
			variant: 'swatches'
		});
	}

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}