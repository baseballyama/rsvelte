import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { BarChart } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';

var root = $.from_html(`<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam pretium, ligula ac sollicitudin
	ullamcorper, leo justo pretium tellus, at gravida ex quam et orci. <!> Sed ipsum justo, facilisis id tempor hendrerit, suscipit eu ipsum. Mauris ut sapien quis nibh volutpat
	venenatis. Ut viverra justo varius sapien convallis venenatis vel faucibus urna.</p>`);

export default function Sparkbar_within_a_paragraph($$anchor, $$props) {
	$.push($$props, true);

	const data = createDateSeries({ count: 30, min: 20, max: 100 });
	var $$exports = { data };
	var p = root();
	var node = $.sibling($.child(p));

	BarChart(node, {
		get data() {
			return data;
		},
		x: 'date',
		y: 'value',
		axis: false,
		grid: false,
		bandPadding: 0.1,
		props: { bars: { radius: 1, strokeWidth: 0 } },
		height: 18,
		width: 124,
		class: 'inline-block'
	});

	$.next();
	$.reset(p);
	$.append($$anchor, p);

	return $.pop($$exports);
}