import * as $ from 'svelte/internal/server';

import {
	LineChart,
	defaultChartPadding,
	Spline,
	Threshold,
	Tooltip,
	Points
} from 'layerchart';

import { curveBumpX } from 'd3-shape';
import { format } from '@layerstack/utils';
import { createDateSeries } from '$lib/utils/data.js';
import CurveMenuField from '$lib/components/controls/fields/CurveMenuField.svelte';

export default function Threshold_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = createDateSeries({
			count: 30,
			min: 50,
			max: 100,
			value: 'integer',
			keys: ['value', 'baseline']
		});

		let selectedCurve = curveBumpX;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			CurveMenuField($$renderer, {
				dense: true,
				class: 'mb-10',
				get value() {
					return selectedCurve;
				},

				set value($$value) {
					selectedCurve = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			{
				function marks($$renderer) {
					{
						function above($$renderer, { curve }) {
							Spline($$renderer, { y: 'value', curve, class: 'stroke-success stroke-2' });
						}

						function below($$renderer, { curve }) {
							Spline($$renderer, { y: 'value', curve, class: 'stroke-danger stroke-2' });
						}

						function children($$renderer, { curve }) {
							Spline($$renderer, {
								y: 'baseline',
								curve,
								class: '[stroke-dasharray:4] opacity-20'
							});
						}

						Threshold($$renderer, {
							curve: selectedCurve,
							above,
							below,
							children,
							$$slots: { above: true, below: true, default: true }
						});
					}

					$$renderer.push(`<!----> `);
					Points($$renderer, { y: 'value', r: 4, class: 'stroke-surface-100' });
					$$renderer.push(`<!---->`);
				}

				function tooltip($$renderer, { context }) {
					{
						function children($$renderer, { data }) {
							if (Tooltip.Header) {
								$$renderer.push('<!--[-->');

								Tooltip.Header($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!---->${$.escape(format(data.date))}`);
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
											Tooltip.Item($$renderer, { label: 'value', value: data.value });
											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (Tooltip.Item) {
											$$renderer.push('<!--[-->');
											Tooltip.Item($$renderer, { label: 'baseline', value: data.baseline });
											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (Tooltip.Separator) {
											$$renderer.push('<!--[-->');
											Tooltip.Separator($$renderer, {});
											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (Tooltip.Item) {
											$$renderer.push('<!--[-->');
											Tooltip.Item($$renderer, { label: 'variance', value: data.value - data.baseline });
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
							Tooltip.Root($$renderer, { context, children, $$slots: { default: true } });
							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					}
				}

				LineChart($$renderer, {
					data,
					x: 'date',
					y: ['value', 'baseline'],
					c: (d) => d.value >= d.baseline ? 'above' : 'below',
					cDomain: ['above', 'below'],
					cRange: ['var(--color-success)', 'var(--color-danger)'],
					props: { highlight: { lines: true, points: false } },
					padding: defaultChartPadding({ top: 10, right: 10 }),
					height: 300,
					marks,
					tooltip,
					$$slots: { marks: true, tooltip: true }
				});
			}

			$$renderer.push(`<!---->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { data });
	});
}