import * as $ from 'svelte/internal/server';
import { Area, Axis, Chart, Highlight, Layer, Tooltip } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';

export default function Multiple_series_using_overrides($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const keys = ['apples', 'bananas', 'oranges'];
		const multiSeriesData = createDateSeries({ count: 30, min: 10, max: 100, value: 'integer', keys });

		const fruitColors = {
			apples: 'var(--color-apples)',
			bananas: 'var(--color-bananas)',
			oranges: 'var(--color-oranges)'
		};

		Chart($$renderer, {
			data: multiSeriesData,
			x: 'date',
			y: ['apples', 'bananas', 'oranges'],
			yDomain: [0, null],
			yNice: true,
			padding: { top: 20, left: 20, bottom: 20, right: 15 },
			tooltipContext: { mode: 'quadtree-x' },
			height: 300,
			children: ($$renderer) => {
				Layer($$renderer, {
					children: ($$renderer) => {
						Axis($$renderer, { placement: 'left', grid: true, rule: true });
						$$renderer.push(`<!----> `);
						Axis($$renderer, { placement: 'bottom', rule: true });
						$$renderer.push(`<!----> `);

						Area($$renderer, {
							y1: (d) => d.apples,
							class: 'stroke-2',
							fill: fruitColors.apples,
							fillOpacity: 0.3,
							line: { stroke: fruitColors.apples, class: 'stroke-2' }
						});

						$$renderer.push(`<!----> `);

						Area($$renderer, {
							y1: (d) => d.bananas,
							class: 'stroke-2',
							fill: fruitColors.bananas,
							fillOpacity: 0.3,
							line: { stroke: fruitColors.bananas, class: 'stroke-2' }
						});

						$$renderer.push(`<!----> `);

						Area($$renderer, {
							y1: (d) => d.oranges,
							class: 'stroke-2',
							fill: fruitColors.oranges,
							fillOpacity: 0.3,
							line: { stroke: fruitColors.oranges, class: 'stroke-2' }
						});

						$$renderer.push(`<!----> `);
						Highlight($$renderer, { y: (d) => d.apples, points: { fill: fruitColors.apples } });
						$$renderer.push(`<!----> `);
						Highlight($$renderer, { y: (d) => d.bananas, points: { fill: fruitColors.bananas } });
						$$renderer.push(`<!----> `);
						Highlight($$renderer, { y: (d) => d.oranges, points: { fill: fruitColors.oranges } });
						$$renderer.push(`<!----> `);
						Highlight($$renderer, { lines: true });
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
										Tooltip.Item($$renderer, { label: 'apples', value: data.apples });
										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (Tooltip.Item) {
										$$renderer.push('<!--[-->');
										Tooltip.Item($$renderer, { label: 'bananas', value: data.bananas });
										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (Tooltip.Item) {
										$$renderer.push('<!--[-->');
										Tooltip.Item($$renderer, { label: 'oranges', value: data.oranges });
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

		$.bind_props($$props, { data: multiSeriesData });
	});
}