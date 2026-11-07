import 'svelte/internal/disclose-version';
import { getAppleStock } from '$lib/data.remote';
import * as $ from 'svelte/internal/client';
import { AnnotationRange, LineChart, defaultChartPadding } from 'layerchart';

const data = await getAppleStock();
var root = $.from_html(`<!> <!> <!>`, 1);

export default function Horizontal_with_fill_multiple($$anchor, $$props) {
	$.push($$props, true);

	var $$exports = { data };

	{
		const belowMarks = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			AnnotationRange(node, { y: [0, 400], class: 'fill-success/10' });

			var node_1 = $.sibling(node, 2);

			AnnotationRange(node_1, { y: [400, 600], class: 'fill-warning/10' });

			var node_2 = $.sibling(node_1, 2);

			AnnotationRange(node_2, { y: [600, null], class: 'fill-danger/10' });
			$.append($$anchor, fragment_1);
		};

		let $0 = $.derived(() => defaultChartPadding({ left: 25, bottom: 15 }));

		LineChart($$anchor, {
			get data() {
				return data;
			},
			x: 'date',
			y: 'value',
			height: 300,
			get padding() {
				return $.get($0);
			},
			belowMarks,
			$$slots: { belowMarks: true }
		});
	}

	return $.pop($$exports);
}