import 'svelte/internal/disclose-version';
import { getAppleStock } from '$lib/data.remote';
import * as $ from 'svelte/internal/client';
import { AnnotationLine, AnnotationRange, LineChart } from 'layerchart';

const data = await getAppleStock();
var root = $.from_html(`<!> <!>`, 1);

export default function Horizontal_with_range($$anchor, $$props) {
	$.push($$props, true);

	var $$exports = { data };

	{
		const aboveMarks = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			AnnotationRange(node, {
				y: [500, null],
				pattern: { size: 8, lines: { rotate: -45, opacity: 0.2 } }
			});

			var node_1 = $.sibling(node, 2);

			AnnotationLine(node_1, {
				y: 500,
				label: 'Max',
				labelPlacement: 'bottom-right',
				labelYOffset: 2,
				props: { line: { dashArray: [2, 2] } }
			});

			$.append($$anchor, fragment_1);
		};

		LineChart($$anchor, {
			get data() {
				return data;
			},
			x: 'date',
			y: 'value',
			height: 300,
			padding: { top: 10, bottom: 20, left: 25 },
			aboveMarks,
			$$slots: { aboveMarks: true }
		});
	}

	return $.pop($$exports);
}