import * as $ from 'svelte/internal/server';
import { scaleBand } from 'd3-scale';
import { mean } from 'd3-array';
import { Bars, Axis, Chart, Layer, Rule, Text } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';

export default function Horizontal_average_annotation_rule($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = createDateSeries({
			count: 10,
			min: 20,
			max: 100,
			value: 'integer',
			keys: ['value', 'baseline']
		});

		{
			function children($$renderer, { context }) {
				const avg = mean(data, (d) => d.value);

				Layer($$renderer, {
					children: ($$renderer) => {
						Axis($$renderer, { placement: 'bottom', grid: true, rule: true });
						$$renderer.push(`<!----> `);
						Axis($$renderer, { placement: 'left', rule: true });
						$$renderer.push(`<!----> `);
						Bars($$renderer, { strokeWidth: 1, class: 'fill-primary' });
						$$renderer.push(`<!----> `);

						Rule($$renderer, {
							x: avg,
							strokeWidth: 2,
							stroke: 'var(--color-danger)',
							dashArray: [4],
							'stroke-linecap': 'round'
						});

						$$renderer.push(`<!----> `);

						Text($$renderer, {
							x: context.xScale(avg),
							y: 0,
							dx: -4,
							value: 'Avg',
							textAnchor: 'end',
							verticalAnchor: 'start',
							class: 'text-sm fill-danger stroke-surface-100 stroke-2'
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});
			}

			Chart($$renderer, {
				data,
				x: 'value',
				xDomain: [0, null],
				xNice: true,
				y: 'date',
				yScale: scaleBand().padding(0.4),
				padding: { left: 32, bottom: 20, right: 8 },
				height: 300,
				children,
				$$slots: { default: true }
			});
		}

		$.bind_props($$props, { data });
	});
}