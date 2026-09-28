import * as $ from 'svelte/internal/server';
import { Chart, Circle, Dodge, Text, Tooltip } from 'layerchart';
import { getLayoffs } from '$lib/data.remote';
import { sortFunc } from '@layerstack/utils';

const all = await getLayoffs();
const data = [...all].filter((d) => d.totalLaidOff != null && d.totalLaidOff > 0).sort(sortFunc('totalLaidOff', 'desc'));

export default function Tech_layoffs($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// Annotate companies with ≥5,000 announced layoffs.
		const labelThreshold = 5_000;

		{
			function marks($$renderer, { context }) {
				{
					function children($$renderer, { items }) {
						$$renderer.push(`<!--[-->`);

						const each_array = $.ensure_array_like(items);

						for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
							let { data: layoff, x, y, r, index } = each_array[$$index];

							Circle($$renderer, {
								cx: x,
								cy: y,
								r,
								class: 'fill-danger/30 stroke-danger',
								onpointermove: (e) => context.tooltip.show(e, layoff),
								onpointerleave: context.tooltip.hide
							});
						}

						$$renderer.push(`<!--]--> <!--[-->`);

						const each_array_1 = $.ensure_array_like(items.filter((d) => d.data.totalLaidOff >= labelThreshold));

						for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
							let { data: layoff, x, y, r, index } = each_array_1[$$index_1];

							Text($$renderer, {
								x,
								y,
								value: layoff.company,
								textAnchor: 'middle',
								verticalAnchor: 'middle',
								fontSize: 10,
								stroke: 'var(--color-surface-100)',
								strokeWidth: 3,
								class: 'pointer-events-none'
							});
						}

						$$renderer.push(`<!--]-->`);
					}

					Dodge($$renderer, {
						axis: 'y',
						anchor: 'bottom',
						padding: 1,
						children,
						$$slots: { default: true }
					});
				}
			}

			function tooltip($$renderer, { context }) {
				{
					function children($$renderer, { data }) {
						if (Tooltip.Header) {
							$$renderer.push('<!--[-->');

							Tooltip.Header($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(data.company)}`);
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
										Tooltip.Item($$renderer, { label: 'Date', value: data.date, format: 'day' });
										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (Tooltip.Item) {
										$$renderer.push('<!--[-->');

										Tooltip.Item($$renderer, {
											label: 'Laid off',
											value: data.totalLaidOff,
											format: 'integer'
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (data.percentageLaidOff != null) {
										$$renderer.push('<!--[0-->');

										if (Tooltip.Item) {
											$$renderer.push('<!--[-->');

											Tooltip.Item($$renderer, {
												label: 'Of workforce',
												value: data.percentageLaidOff,
												format: 'percentRound'
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}
									} else {
										$$renderer.push('<!--[-1-->');
									}

									$$renderer.push(`<!--]--> `);

									if (Tooltip.Item) {
										$$renderer.push('<!--[-->');
										Tooltip.Item($$renderer, { label: 'Industry', value: data.industry });
										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (Tooltip.Item) {
										$$renderer.push('<!--[-->');
										Tooltip.Item($$renderer, { label: 'Location', value: data.location });
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

			Chart($$renderer, {
				data,
				x: 'date',
				r: 'totalLaidOff',
				rRange: [1, 20],
				padding: { top: 12, bottom: 24, left: 12, right: 12 },
				height: 1000,
				axis: { placement: 'bottom', rule: true },
				marks,
				tooltip,
				$$slots: { marks: true, tooltip: true }
			});
		}

		$.bind_props($$props, { data });
	});
}