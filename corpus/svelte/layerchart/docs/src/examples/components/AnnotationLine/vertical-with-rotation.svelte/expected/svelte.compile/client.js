import 'svelte/internal/disclose-version';
import { getAppleStock } from '$lib/data.remote';
import * as $ from 'svelte/internal/client';
import { AnnotationLine, LineChart } from 'layerchart';

const data = await getAppleStock();
var root = $.from_html(`<!> <!>`, 1);

export default function Vertical_with_rotation($$anchor, $$props) {
	$.push($$props, true);

	var $$exports = { data };

	{
		const aboveMarks = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			AnnotationLine(node, {
				x: new Date('2010-01-01'),
				label: 'Start',
				labelXOffset: 4,
				props: {
					line: { dashArray: [2, 2], stroke: 'var(--color-danger)' },
					label: {
						fill: 'var(--color-danger)',
						rotate: -90,
						textAnchor: 'end',
						verticalAnchor: 'end',
						dx: -2,
						dy: 0
					}
				}
			});

			var node_1 = $.sibling(node, 2);

			AnnotationLine(node_1, {
				x: new Date('2010-12-31'),
				label: 'End',
				labelXOffset: 4,
				props: {
					line: { dashArray: [2, 2], stroke: 'var(--color-danger)' },
					label: {
						fill: 'var(--color-danger)',
						rotate: 90,
						verticalAnchor: 'end',
						dx: -4,
						dy: 0
					}
				}
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