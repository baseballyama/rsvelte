import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Legend } from 'layerchart';
import { scaleSqrt } from 'd3-scale';

var root = $.from_html(`<div class="grid gap-6"><!> <!></div>`);

export default function Sqrt($$anchor, $$props) {
	$.push($$props, true);

	var div = root();
	var node = $.child(div);

	{
		let $0 = $.derived(() => scaleSqrt([-100, 0, 100], ['blue', 'white', 'red']));

		Legend(node, {
			get scale() {
				return $.get($0);
			},
			title: 'Temperature (°C)'
		});
	}

	var node_1 = $.sibling(node, 2);

	{
		let $0 = $.derived(() => scaleSqrt([-100, 0, 100], ['blue', 'white', 'red']));

		Legend(node_1, {
			get scale() {
				return $.get($0);
			},
			title: 'Temperature (°C)',
			variant: 'swatches'
		});
	}

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}