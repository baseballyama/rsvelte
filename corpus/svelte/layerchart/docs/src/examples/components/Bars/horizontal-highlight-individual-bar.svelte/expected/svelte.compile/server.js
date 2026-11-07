import * as $ from 'svelte/internal/server';
import { scaleBand } from 'd3-scale';
import { Bars, Axis, Chart, Highlight, Layer, Pattern } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';

export default function Horizontal_highlight_individual_bar($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = createDateSeries({
			count: 10,
			min: 20,
			max: 100,
			value: 'integer',
			keys: ['value', 'baseline']
		});

		Chart($$renderer, {
			data,
			x: 'value',
			xDomain: [0, null],
			xNice: true,
			y: 'date',
			yScale: scaleBand().padding(0.4),
			padding: { left: 32, bottom: 20, right: 8 },
			height: 300,
			children: ($$renderer) => {
				Layer($$renderer, {
					children: ($$renderer) => {
						Axis($$renderer, { placement: 'bottom', grid: true, rule: true });
						$$renderer.push(`<!----> `);
						Axis($$renderer, { placement: 'left', rule: true });
						$$renderer.push(`<!----> `);

						{
							function children($$renderer, { pattern }) {
								Highlight($$renderer, {
									data: data[3],
									area: { fill: pattern, class: 'stroke-secondary/50' }
								});
							}

							Pattern($$renderer, {
								size: 8,
								lines: { rotate: -45, color: 'var(--color-secondary)', opacity: 0.3 },
								background: 'color-mix(in oklab, var(--color-secondary) 10%, transparent)',
								children,
								$$slots: { default: true }
							});
						}

						$$renderer.push(`<!----> `);
						Bars($$renderer, { strokeWidth: 1, class: 'fill-primary' });
						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$.bind_props($$props, { data });
	});
}