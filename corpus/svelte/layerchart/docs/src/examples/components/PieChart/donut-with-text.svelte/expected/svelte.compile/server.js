import * as $ from 'svelte/internal/server';
import { PieChart, Text } from 'layerchart';
import { fruitColors } from '$lib/utils/fruits';
import { longData } from '$lib/utils/data';
import { format } from '@layerstack/utils';
import { sum } from 'd3-array';

export default function Donut_with_text($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = longData.filter((d) => d.year === 2019);

		{
			function aboveMarks($$renderer) {
				Text($$renderer, {
					value: format(sum(data, (d) => d.value)),
					textAnchor: 'middle',
					verticalAnchor: 'middle',
					class: 'text-4xl',
					dy: 4
				});

				$$renderer.push(`<!----> `);

				Text($$renderer, {
					value: 'total',
					textAnchor: 'middle',
					verticalAnchor: 'middle',
					class: 'text-sm fill-surface-content/50',
					dy: 26
				});

				$$renderer.push(`<!---->`);
			}

			PieChart($$renderer, {
				data,
				key: 'fruit',
				value: 'value',
				cRange: fruitColors,
				innerRadius: -20,
				cornerRadius: 5,
				padAngle: 0.02,
				height: 300,
				aboveMarks,
				$$slots: { aboveMarks: true }
			});
		}

		$.bind_props($$props, { data });
	});
}