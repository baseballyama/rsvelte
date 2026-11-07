import * as $ from 'svelte/internal/server';
import { Area, BarChart, Tooltip } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';

export const layers = ['svg', 'canvas'];

export default function Compound_common_scale_with_extra_marks($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = createDateSeries({
			count: 30,
			min: 20,
			max: 100,
			value: 'integer',
			keys: ['value', 'baseline']
		});

		{
			function aboveMarks($$renderer) {
				Area($$renderer, {
					y1: 'value',
					class: 'fill-secondary/20',
					line: { class: 'stroke-secondary' }
				});
			}

			function tooltip($$renderer) {
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

										Tooltip.Item($$renderer, {
											label: 'baseline',
											value: data.baseline,
											color: 'var(--color-primary)'
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (Tooltip.Item) {
										$$renderer.push('<!--[-->');

										Tooltip.Item($$renderer, {
											label: 'value',
											value: data.value,
											color: 'var(--color-secondary)'
										});

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
			}

			BarChart($$renderer, {
				data,
				x: 'date',
				y: ['baseline', 'value'],
				props: { bars: { y: 'baseline' } },
				height: 300,
				aboveMarks,
				tooltip,
				$$slots: { aboveMarks: true, tooltip: true }
			});
		}

		$.bind_props($$props, { data });
	});
}