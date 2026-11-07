import * as $ from 'svelte/internal/server';
import { Axis, Chart, Highlight, Layer, Spline, Tooltip } from 'layerchart';
import { getNewPassengerCars } from '$lib/data.remote.js';

const data = await getNewPassengerCars();

export default function Compound_dual_axis_with_stacked_charts($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<div class="grid grid-stack p-4 border rounded-sm">`);

		Chart($$renderer, {
			data,
			x: 'year',
			y: 'sales',
			yDomain: [0, null],
			yNice: true,
			padding: { top: 24, bottom: 24, left: 24, right: 24 },
			height: 300,
			children: ($$renderer) => {
				Layer($$renderer, {
					children: ($$renderer) => {
						Axis($$renderer, {
							placement: 'left',
							rule: true,
							format: 'metric',
							label: '↑ sales (M)',
							labelPlacement: 'start',
							labelProps: { class: 'fill-primary' }
						});

						$$renderer.push(`<!----> `);
						Axis($$renderer, { placement: 'bottom', format: 'none', rule: true });
						$$renderer.push(`<!----> `);
						Spline($$renderer, { class: 'stroke-2 stroke-primary' });
						$$renderer.push(`<!----> `);
						Highlight($$renderer, { lines: true, points: true });
						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Chart($$renderer, {
			data,
			x: 'year',
			y: 'efficiency',
			padding: { top: 24, bottom: 24, left: 24, right: 24 },
			tooltipContext: { mode: 'quadtree-x' },
			children: ($$renderer) => {
				Layer($$renderer, {
					children: ($$renderer) => {
						Axis($$renderer, {
							placement: 'right',
							rule: true,
							label: 'efficiency (mpg) ↑',
							labelPlacement: 'start',
							labelProps: { class: 'fill-secondary' }
						});

						$$renderer.push(`<!----> `);
						Spline($$renderer, { class: 'stroke-2 stroke-secondary' });
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

							Tooltip.Header($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(data.year)}`);
								},
								$$slots: { default: true }
							});

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
										Tooltip.Item($$renderer, { label: 'sales', value: data.sales, format: 'currencyRound' });
										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (Tooltip.Item) {
										$$renderer.push('<!--[-->');
										Tooltip.Item($$renderer, { label: 'efficiency', value: data.efficiency });
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

		$$renderer.push(`<!----></div>`);
		$.bind_props($$props, { data });
	});
}