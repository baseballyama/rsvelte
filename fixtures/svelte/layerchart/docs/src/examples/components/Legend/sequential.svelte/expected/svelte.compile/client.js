import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Legend } from 'layerchart';
import { scaleSequential } from 'd3-scale';
import { interpolateViridis } from 'd3-scale-chromatic';

var root = $.from_html(`<div class="grid gap-6"><!> <!></div>`);

export default function Sequential($$anchor, $$props) {
	$.push($$props, true);

	var div = root();
	var node = $.child(div);

	{
		let $0 = $.derived(() => scaleSequential([0, 100], interpolateViridis));

		Legend(node, {
			get scale() {
				return $.get($0);
			},
			title: 'Temperature (°F)'
		});
	}

	var node_1 = $.sibling(node, 2);

	{
		let $0 = $.derived(() => scaleSequential([0, 100], interpolateViridis));

		Legend(node_1, {
			get scale() {
				return $.get($0);
			},
			title: 'Temperature (°F)',
			variant: 'swatches'
		});
	}

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}