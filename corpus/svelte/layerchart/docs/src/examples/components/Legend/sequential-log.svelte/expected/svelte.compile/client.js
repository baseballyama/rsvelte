import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Legend } from 'layerchart';
import { scaleSequentialLog } from 'd3-scale';
import { interpolateBlues } from 'd3-scale-chromatic';

var root = $.from_html(`<div class="grid gap-6"><!></div>`);

export default function Sequential_log($$anchor, $$props) {
	$.push($$props, true);

	var div = root();
	var node = $.child(div);

	{
		let $0 = $.derived(() => scaleSequentialLog([1, 100], interpolateBlues));

		Legend(node, {
			get scale() {
				return $.get($0);
			},
			title: 'Energy (joules)',
			ticks: 10
		});
	}

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}