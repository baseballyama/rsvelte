import * as $ from 'svelte/internal/server';
import { Axis, Chart, Highlight, Layer, Spline, Tooltip } from 'layerchart';

export default function Multiple_series_using_overrides($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = Array.from({ length: 90 }).map((_, i) => ({
			x: i,
			y: Math.floor(Math.random() * 90),
			y1: Math.floor(Math.random() * 90)
		}));

		const fruitColors = {
			bananas: 'var(--color-success)',
			oranges: 'var(--color-warning)'
		};

		Chart($$renderer, {
			data,
			x: 'x',
			y: 'y',
			yDomain: [0, null],
			yNice: true,
			padding: 25,
			tooltipContext: { mode: 'quadtree-x' },
			height: 300,
			children: ($$renderer) => {
				Layer($$renderer, {
					children: ($$renderer) => {
						Axis($$renderer, { placement: 'left', grid: true, rule: true });
						$$renderer.push(`<!----> `);
						Axis($$renderer, { placement: 'bottom', rule: true });
						$$renderer.push(`<!----> `);

						Spline($$renderer, {
							y: (d) => d.y,
							class: 'stroke-2',
							stroke: fruitColors.bananas
						});

						$$renderer.push(`<!----> `);

						Spline($$renderer, {
							y: (d) => d.y1,
							class: 'stroke-2',
							stroke: fruitColors.oranges
						});

						$$renderer.push(`<!----> `);
						Highlight($$renderer, { y: (d) => d.y, points: { fill: fruitColors.bananas } });
						$$renderer.push(`<!----> `);
						Highlight($$renderer, { y: (d) => d.y1, points: { fill: fruitColors.oranges } });
						$$renderer.push(`<!----> `);
						Highlight($$renderer, { lines: true });
						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				{
					function children($$renderer, { data }) {
						if (Tooltip.List) {
							$$renderer.push('<!--[-->');

							Tooltip.List($$renderer, {
								children: ($$renderer) => {
									if (Tooltip.Item) {
										$$renderer.push('<!--[-->');
										Tooltip.Item($$renderer, { label: 'bananas', value: data.y });
										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (Tooltip.Item) {
										$$renderer.push('<!--[-->');
										Tooltip.Item($$renderer, { label: 'oranges', value: data.y1 });
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

		$.bind_props($$props, { data });
	});
}