import * as $ from 'svelte/internal/server';
import { scaleSqrt } from 'd3-scale';
import { Chart, Circle, Dodge, Text, Tooltip } from 'layerchart';
import { getBankFailures } from '$lib/data.remote';
import { sortFunc } from '@layerstack/utils';

const all = await getBankFailures();
const data = [...all].sort(sortFunc('assets', 'desc'));

export default function Bank_failures($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// Threshold (in $thousands) above which we annotate each circle with the bank name.
		const labelThreshold = 25_000_000; // $25B+

		const dollars = (thousands) => {
			const dollars = thousands * 1_000;

			if (dollars >= 1e12) return (dollars / 1e12).toFixed(1) + 'T';
			if (dollars >= 1e9) return (dollars / 1e9).toFixed(1) + 'B';
			if (dollars >= 1e6) return (dollars / 1e6).toFixed(0) + 'M';

			return dollars.toLocaleString();
		};

		const titleCase = (s) => s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

		{
			function marks($$renderer, { context }) {
				{
					function children($$renderer, { items }) {
						$$renderer.push(`<!--[-->`);

						const each_array = $.ensure_array_like(items);

						for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
							let { data: bank, x, y, r, index } = each_array[$$index];

							Circle($$renderer, {
								cx: x,
								cy: y,
								r,
								class: 'fill-surface-content/15 stroke-surface-content/60',
								onpointermove: (e) => context.tooltip.show(e, bank),
								onpointerleave: context.tooltip.hide
							});

							$$renderer.push(`<!----> `);

							if (bank.assets >= labelThreshold) {
								$$renderer.push('<!--[0-->');

								Text($$renderer, {
									x,
									y,
									value: titleCase(bank.name),
									textAnchor: 'middle',
									verticalAnchor: 'middle',
									fontSize: 10,
									class: 'fill-surface-content pointer-events-none'
								});
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]-->`);
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
									$$renderer.push(`<!---->${$.escape(titleCase(data.name))}`);
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
										Tooltip.Item($$renderer, { label: 'Failed', value: data.failDate, format: 'day' });
										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (Tooltip.Item) {
										$$renderer.push('<!--[-->');

										Tooltip.Item($$renderer, {
											label: 'Assets',
											value: `$${$.stringify(dollars(data.assets))}`
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
											label: 'Deposits',
											value: `$${$.stringify(dollars(data.deposits))}`
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
											label: 'Location',
											value: `${$.stringify(data.city)}, ${$.stringify(data.state)}`
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
				x: 'failDate',
				r: 'assets',
				rScale: scaleSqrt(),
				rRange: [2, 30],
				padding: { top: 12, bottom: 24, left: 12, right: 12 },
				height: 2800,
				axis: {
					placement: 'bottom',
					rule: true,
					format: (d) => d.getUTCFullYear().toString()
				},
				marks,
				tooltip,
				$$slots: { marks: true, tooltip: true }
			});
		}

		$.bind_props($$props, { data });
	});
}