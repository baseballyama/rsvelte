import * as $ from 'svelte/internal/server';
import { AreaChart, defaultChartPadding, Tooltip } from 'layerchart';
import { format, sortFunc } from '@layerstack/utils';
import { getAppleStock } from '$lib/data.remote';

const data = await getAppleStock();

export default function Point_annotations($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// Get a few random points to use for annotations
		const annotations = $.derived(() => [...data].sort(() => Math.random() - 0.5).slice(0, 5).sort(sortFunc('date')).map((d, i) => ({
			date: d.date,
			label: String.fromCharCode(65 + i),
			details: `This is an annotation for ${format(d.date)}`
		})));

		{
			function tooltip($$renderer, { context }) {
				{
					function children($$renderer, { data }) {
						if (data.annotation) {
							$$renderer.push(`<!--[0--><div class="whitespace-nowrap">${$.escape(data.annotation.details)}</div>`);
						} else {
							$$renderer.push('<!--[-1-->');

							if (Tooltip.Header) {
								$$renderer.push('<!--[-->');

								Tooltip.Header($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!---->${$.escape(format(context.x(data), 'day'))}`);
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
											Tooltip.Item($$renderer, { label: 'value', value: context.y(data) });
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

						$$renderer.push(`<!--]-->`);
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

			AreaChart($$renderer, {
				data,
				x: 'date',
				y: 'value',
				annotations: annotations().map((a) => {
					return {
						type: 'point',
						label: a.label,
						details: a.details,
						x: a.date,
						r: 6,
						props: {
							circle: { class: 'fill-secondary' },
							label: { class: 'text-[10px] fill-secondary-content font-bold' }
						}
					};
				}),
				padding: defaultChartPadding({ left: 25 }),
				height: 300,
				tooltip,
				$$slots: { tooltip: true }
			});
		}

		$.bind_props($$props, { data });
	});
}