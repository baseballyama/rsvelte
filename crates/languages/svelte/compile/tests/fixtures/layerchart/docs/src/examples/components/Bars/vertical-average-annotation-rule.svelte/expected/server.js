import * as $ from 'svelte/internal/server';
import { Axis, Bars, Chart, Layer, Rule, Text } from 'layerchart';
import { scaleBand } from 'd3-scale';
import { mean } from 'd3-array';
import { createDateSeries } from '$lib/utils/data.js';

export default function Vertical_average_annotation_rule($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = createDateSeries({ count: 20, min: 20, max: 100 });
		const avg = mean(data, (d) => d.value);

		{
			function children($$renderer, { context }) {
				Layer($$renderer, {
					children: ($$renderer) => {
						Axis($$renderer, { placement: 'left', grid: true, rule: true });
						$$renderer.push(`<!----> `);
						Axis($$renderer, { placement: 'bottom', rule: true });
						$$renderer.push(`<!----> `);
						Bars($$renderer, { strokeWidth: 1, class: 'fill-primary' });
						$$renderer.push(`<!----> `);

						Rule($$renderer, {
							y: avg,
							strokeWidth: 2,
							stroke: 'var(--color-danger)',
							dashArray: [4],
							'stroke-linecap': 'round'
						});

						$$renderer.push(`<!----> `);

						Text($$renderer, {
							x: context.width,
							y: context.yScale(avg),
							dy: -6,
							value: 'Avg',
							textAnchor: 'end',
							verticalAnchor: 'end',
							class: 'text-sm fill-danger stroke-surface-100 stroke-2'
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});
			}

			Chart($$renderer, {
				data,
				x: 'date',
				xScale: scaleBand().padding(0.4),
				y: 'value',
				yDomain: [0, null],
				yNice: true,
				padding: { left: 24, bottom: 20, top: 8 },
				height: 300,
				children,
				$$slots: { default: true }
			});
		}

		$.bind_props($$props, { data });
	});
}