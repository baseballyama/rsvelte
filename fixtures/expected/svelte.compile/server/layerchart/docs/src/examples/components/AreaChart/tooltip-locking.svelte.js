import * as $ from 'svelte/internal/server';
import { accessor, AreaChart, defaultChartPadding, Tooltip } from 'layerchart';
import { createDateSeries } from '$lib/utils/data.js';
import { format } from '@layerstack/utils';
import { Button, Kbd } from 'svelte-ux';

export default function Tooltip_locking($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = createDateSeries({
			count: 30,
			min: 10,
			max: 100,
			value: 'integer',
			keys: ['apples', 'bananas', 'oranges']
		});

		let lockedTooltip = false;

		{
			function tooltip($$renderer, { context, setHighlightKey, series }) {
				{
					function children($$renderer, { data }) {
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
									$$renderer.push(`<!--[-->`);

									const each_array = $.ensure_array_like(series);

									for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
										let s = each_array[$$index];
										const valueAccessor = accessor(s.value ?? s.key);
										const value = Math.abs(valueAccessor(data));

										if (Tooltip.Item) {
											$$renderer.push('<!--[-->');

											Tooltip.Item($$renderer, {
												label: s.key,
												color: s.color,
												onpointerenter: () => setHighlightKey(s.key),
												onpointerleave: () => setHighlightKey(null),
												children: ($$renderer) => {
													$$renderer.push(`<!---->${$.escape(format(value))} `);

													Button($$renderer, {
														variant: 'fill-light',
														size: 'sm',
														class: 'ml-2',
														children: ($$renderer) => {
															$$renderer.push(`<!---->Click me`);
														},
														$$slots: { default: true }
													});

													$$renderer.push(`<!---->`);
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
								},
								$$slots: { default: true }
							});

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

						$$renderer.push(` <div class="text-xs">Lock position with `);
						Kbd($$renderer, { command: true });
						$$renderer.push(`<!----> and view console</div>`);
					}

					if (Tooltip.Root) {
						$$renderer.push('<!--[-->');
						Tooltip.Root($$renderer, { pointerEvents: true, children, $$slots: { default: true } });
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
				series: [
					{ key: 'apples', color: 'var(--color-apples)' },
					{ key: 'bananas', color: 'var(--color-bananas)' },
					{ key: 'oranges', color: 'var(--color-oranges)' }
				],
				props: { tooltip: { context: { locked: lockedTooltip } } },
				padding: defaultChartPadding({ right: 10 }),
				height: 300,
				tooltip,
				$$slots: { tooltip: true }
			});
		}

		$.bind_props($$props, { data });
	});
}