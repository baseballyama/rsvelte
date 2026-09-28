import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { PieChart, Text } from 'layerchart';
import { fruitColors } from '$lib/utils/fruits';
import { longData } from '$lib/utils/data';
import { format } from '@layerstack/utils';
import { sum } from 'd3-array';

var root = $.from_html(`<!> <!>`, 1);

export default function Donut_with_text($$anchor, $$props) {
	$.push($$props, true);

	const data = longData.filter((d) => d.year === 2019);
	var $$exports = { data };

	{
		const aboveMarks = ($$anchor) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			{
				let $0 = $.derived(() => format(sum(data, (d) => d.value)));

				Text(node, {
					get value() {
						return $.get($0);
					},
					textAnchor: 'middle',
					verticalAnchor: 'middle',
					class: 'text-4xl',
					dy: 4
				});
			}

			var node_1 = $.sibling(node, 2);

			Text(node_1, {
				value: 'total',
				textAnchor: 'middle',
				verticalAnchor: 'middle',
				class: 'text-sm fill-surface-content/50',
				dy: 26
			});

			$.append($$anchor, fragment_1);
		};

		PieChart($$anchor, {
			get data() {
				return data;
			},
			key: 'fruit',
			value: 'value',
			get cRange() {
				return fruitColors;
			},
			innerRadius: -20,
			cornerRadius: 5,
			padAngle: 0.02,
			height: 300,
			aboveMarks,
			$$slots: { aboveMarks: true }
		});
	}

	return $.pop($$exports);
}