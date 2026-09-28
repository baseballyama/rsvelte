import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { LineChart } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';

var root = $.from_html(`<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam pretium, ligula ac sollicitudin
	ullamcorper, leo justo pretium tellus, at gravida ex quam et orci. <!> Sed ipsum justo, facilisis id tempor hendrerit, suscipit eu ipsum. Mauris ut sapien quis nibh volutpat
	venenatis. Ut viverra justo varius sapien convallis venenatis vel faucibus urna.</p>`);

export default function Sparkline_within_a_paragraph($$anchor, $$props) {
	$.push($$props, true);

	const data = createDateSeries({ count: 50, min: 50, max: 100 });
	var $$exports = { data };
	var p = root();
	var node = $.sibling($.child(p));

	LineChart(node, {
		get data() {
			return data;
		},
		x: 'date',
		y: 'value',
		yDomain: null,
		axis: false,
		grid: false,
		props: {
			highlight: { points: { r: 3, class: 'stroke-2 stroke-surface-100' } }
		},
		height: 18,
		width: 124,
		class: 'inline-block'
	});

	$.next();
	$.reset(p);
	$.append($$anchor, p);

	return $.pop($$exports);
}