import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Legend } from 'layerchart';
import { scaleQuantize } from 'd3-scale';
import { schemePurples } from 'd3-scale-chromatic';

var root = $.from_html(`<div class="grid gap-6"><!></div>`);

export default function Quantize($$anchor, $$props) {
	$.push($$props, true);

	var div = root();
	var node = $.child(div);

	{
		let $0 = $.derived(() => scaleQuantize([1, 10], schemePurples[9]));

		Legend(node, {
			get scale() {
				return $.get($0);
			},
			title: 'Unemployment rate (%)'
		});
	}

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}