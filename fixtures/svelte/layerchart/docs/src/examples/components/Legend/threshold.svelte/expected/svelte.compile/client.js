import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Legend } from 'layerchart';
import { scaleThreshold } from 'd3-scale';
import { schemeRdBu } from 'd3-scale-chromatic';

var root = $.from_html(`<div class="grid gap-6"><!></div>`);

export default function Threshold($$anchor, $$props) {
	$.push($$props, true);

	var div = root();
	var node = $.child(div);

	{
		let $0 = $.derived(() => scaleThreshold([2.5, 3.1, 3.5, 3.9, 6, 7, 8, 9.5], schemeRdBu[9]));

		Legend(node, {
			get scale() {
				return $.get($0);
			},
			title: 'Unemployment rate (%)',
			tickLength: 0
		});
	}

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}