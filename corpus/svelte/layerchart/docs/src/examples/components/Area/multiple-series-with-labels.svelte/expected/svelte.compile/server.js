import * as $ from 'svelte/internal/server';

import {
	Area,
	Axis,
	Chart,
	Highlight,
	Labels,
	Layer,
	Tooltip,
	pivotLonger
} from 'layerchart';

import { createDateSeries } from '$lib/utils/data.js';

export default function Multiple_series_with_labels($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const keys = ['apples', 'bananas', 'oranges'];
		const multiSeriesData = createDateSeries({ count: 30, min: 10, max: 100, value: 'integer', keys });
		const multiSeriesFlatData = pivotLonger(multiSeriesData, keys, 'fruit', 'value');

		const fruitColors = {
			apples: 'var(--color-apples)',
			bananas: 'var(--color-bananas)',
			oranges: 'var(--color-oranges)'
		};

		Chart($$renderer, {
			data: multiSeriesFlatData,
			x: 'date',
			y: 'value',
			yDomain: [0, null],
			yNice: true,
			c: 'fruit',
			cDomain: Object.keys(fruitColors),
			cRange: Object.values(fruitColors),
			seriesLayout: 'overlap',
			tooltipContext: { mode: 'quadtree' },
			padding: 20,
			height: 300,
			children: ($$renderer) => {
				Layer($$renderer, {
					children: ($$renderer) => {
						Axis($$renderer, { placement: 'left', grid: true, rule: true });
						$$renderer.push(`<!----> `);
						Axis($$renderer, { placement: 'bottom', rule: true });
						$$renderer.push(`<!----> `);
						Area($$renderer, { fill: 'fruit', fillOpacity: 0.3, line: { class: 'stroke-2' } });
						$$renderer.push(`<!----> `);
						Labels($$renderer, { format: 'integer' });
						$$renderer.push(`<!----> `);
						Highlight($$renderer, { points: true, lines: true });
						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				{
					function children($$renderer, { data }) {
						if (Tooltip.Header) {
							$$renderer.push('<!--[-->');
							Tooltip.Header($$renderer, { value: data.date, format: 'day' });
							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (Tooltip.List) {
							$$renderer.push('<!--[-->');

							Tooltip.List($$renderer, {
								children: ($$renderer) => {
									if (Tooltip.Item) {
										$$renderer.push('<!--[-->');
										Tooltip.Item($$renderer, { label: data.fruit, value: data.value });
										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					}

					if (Tooltip.Root) {
						$$renderer.push('<!--[-->');
						Tooltip.Root($$renderer, { children, $$slots: { default: true } });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				}
			},
			$$slots: { default: true }
		});

		$.bind_props($$props, { data: multiSeriesFlatData });
	});
}