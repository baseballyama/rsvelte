import * as $ from 'svelte/internal/server';
import { rollups, sum } from 'd3-array';
import { scaleBand } from 'd3-scale';
import { interpolateYlOrRd, schemeBuGn, schemeGnBu, schemeSpectral } from 'd3-scale-chromatic';
import { forceX, forceY, forceCollide } from 'd3-force';
import { Field, ToggleGroup, ToggleOption } from 'svelte-ux';
import { asAny, Axis, Chart, Circle, Layer, Tooltip } from 'layerchart';
import { ForceSimulation } from 'layerchart/force';
import { getLayoffs } from '$lib/data.remote';

const all = await getLayoffs();

export default function Layoffs_by_industry($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let splitByYear = true;
		let alpha = 1;

		// Reheat the simulation when the layout toggles so it animates to the new targets.
		// Limit to events with a known headcount and the top industries (by total layoffs).
		const data = $.derived(() => {
			const known = all.filter((d) => d.totalLaidOff != null && d.totalLaidOff > 0 && !!d.industry);
			const totals = rollups(known, (rows) => sum(rows, (d) => d.totalLaidOff), (d) => d.industry).sort((a, b) => b[1] - a[1]);
			const topIndustries = new Set(totals.slice(0, 10).map(([industry]) => industry));

			return known.filter((d) => topIndustries.has(d.industry)).map((d) => ({ ...d, year: d.date.getUTCFullYear() }));
		});

		const industries = $.derived(() => Array.from(new Set(data().map((d) => d.industry))).sort((a, b) => a.localeCompare(b)));
		const years = $.derived(() => Array.from(new Set(data().map((d) => d.year))).sort((a, b) => a - b));

		// Sequential YlOrRd palette across the year range (oldest = pale, newest = red).
		const yearColors = $.derived(() => years().map((_, i) => interpolateYlOrRd(0.25 + 0.7 * i / Math.max(years().length - 1, 1))));

		const xForce = forceX();
		const yForce = forceY();
		const collideForce = forceCollide();
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="flex justify-end mb-4 screenshot-hidden">`);

			Field($$renderer, {
				labelPlacement: 'left',
				class: 'mb-1',
				dense: true,
				children: ($$renderer) => {
					ToggleGroup($$renderer, {
						size: 'sm',
						get value() {
							return splitByYear;
						},

						set value($$value) {
							splitByYear = $$value;
							$$settled = false;
						},

						children: ($$renderer) => {
							ToggleOption($$renderer, {
								value: true,
								children: ($$renderer) => {
									$$renderer.push(`<!---->Split by year`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							ToggleOption($$renderer, {
								value: false,
								children: ($$renderer) => {
									$$renderer.push(`<!---->All years`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div> `);

			{
				function children($$renderer, { context }) {
					const xBandwidth = context.xScale.bandwidth?.() ?? 0;
					const yBandwidth = context.yScale.bandwidth?.() ?? 0;

					Layer($$renderer, {
						children: ($$renderer) => {
							Axis($$renderer, { placement: 'top' });
							$$renderer.push(`<!----> `);

							if (splitByYear) {
								$$renderer.push('<!--[0-->');
								Axis($$renderer, { placement: 'left' });
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--> `);

							{
								function children($$renderer, { nodes }) {
									$$renderer.push(`<!--[-->`);

									const each_array = $.ensure_array_like(nodes);

									for (let index = 0, $$length = each_array.length; index < $$length; index++) {
										let node = each_array[index];

										Circle($$renderer, {
											cx: node.x,
											cy: node.y,
											r: Number(context.rGet(node)),
											fill: context.cScale?.(node.year),
											fillOpacity: 0.5,
											stroke: 'none',
											onpointermove: (e) => context.tooltip.show(e, node),
											onpointerleave: context.tooltip.hide
										});
									}

									$$renderer.push(`<!--]-->`);
								}

								ForceSimulation($$renderer, {
									forces: {
										x: xForce.x((d) => context.xGet(asAny(d)) + xBandwidth / 2),
										y: yForce.y((d) => splitByYear
											? Number(context.yGet(asAny(d))) + yBandwidth / 2
											: context.height / 2),
										collide: collideForce.radius((d) => Number(context.rGet(asAny(d))) + 1)
									},
									data: { nodes: data() },
									get alpha() {
										return alpha;
									},

									set alpha($$value) {
										alpha = $$value;
										$$settled = false;
									},
									children,
									$$slots: { default: true }
								});
							}

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
					data: data(),
					x: 'industry',
					xDomain: industries(),
					y: 'year',
					yScale: scaleBand(),
					r: 'totalLaidOff',
					rRange: [2, 14],
					c: 'year',
					cDomain: years(),
					cRange: [
						'var(--color-orange-800)',
						'var(--color-orange-700)',
						'var(--color-orange-600)',
						'var(--color-orange-500)',
						'var(--color-orange-400)',
						'var(--color-orange-300)',
						'var(--color-orange-200)',
						'var(--color-orange-100)'
					],
					padding: { top: 12, bottom: 28, left: 28, right: 12 },
					height: splitByYear ? Math.max(400, years().length * 90) : 400,
					children,
					$$slots: { default: true }
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
	});
}