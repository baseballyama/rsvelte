import 'svelte/internal/disclose-version';
import { getLayoffs } from '$lib/data.remote';
import * as $ from 'svelte/internal/client';
import { rollups, sum } from 'd3-array';
import { scaleBand } from 'd3-scale';
import { interpolateYlOrRd, schemeBuGn, schemeGnBu, schemeSpectral } from 'd3-scale-chromatic';
import { forceX, forceY, forceCollide } from 'd3-force';
import { Field, ToggleGroup, ToggleOption } from 'svelte-ux';
import { asAny, Axis, Chart, Circle, Layer, Tooltip } from 'layerchart';
import { ForceSimulation } from 'layerchart/force';

const all = await getLayoffs();
var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_3 = $.from_html(`<div class="flex justify-end mb-4 screenshot-hidden"><!></div> <!>`, 1);

export default function Layoffs_by_industry($$anchor, $$props) {
	$.push($$props, true);

	let splitByYear = $.state(true);
	let alpha = $.state(1);

	// Reheat the simulation when the layout toggles so it animates to the new targets.
	$.user_pre_effect(() => {
		void $.get(splitByYear);
		$.set(alpha, 1);
	});

	// Limit to events with a known headcount and the top industries (by total layoffs).
	const data = $.derived(() => {
		const known = all.filter((d) => d.totalLaidOff != null && d.totalLaidOff > 0 && !!d.industry);
		const totals = rollups(known, (rows) => sum(rows, (d) => d.totalLaidOff), (d) => d.industry).sort((a, b) => b[1] - a[1]);
		const topIndustries = new Set(totals.slice(0, 10).map(([industry]) => industry));

		return known.filter((d) => topIndustries.has(d.industry)).map((d) => ({ ...d, year: d.date.getUTCFullYear() }));
	});

	const industries = $.derived(() => Array.from(new Set($.get(data).map((d) => d.industry))).sort((a, b) => a.localeCompare(b)));
	const years = $.derived(() => Array.from(new Set($.get(data).map((d) => d.year))).sort((a, b) => a - b));

	// Sequential YlOrRd palette across the year range (oldest = pale, newest = red).
	const yearColors = $.derived(() => $.get(years).map((_, i) => interpolateYlOrRd(0.25 + 0.7 * i / Math.max($.get(years).length - 1, 1))));

	const xForce = forceX();
	const yForce = forceY();
	const collideForce = forceCollide();
	var fragment = root_3();
	var div = $.first_child(fragment);
	var node_1 = $.child(div);

	Field(node_1, {
		labelPlacement: 'left',
		class: 'mb-1',
		dense: true,
		children: ($$anchor, $$slotProps) => {
			ToggleGroup($$anchor, {
				size: 'sm',
				get value() {
					return $.get(splitByYear);
				},

				set value($$value) {
					$.set(splitByYear, $$value, true);
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_2 = $.first_child(fragment_2);

					ToggleOption(node_2, {
						value: true,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Split by year');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});

					var node_3 = $.sibling(node_2, 2);

					ToggleOption(node_3, {
						value: false,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('All years');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.reset(div);

	var node_4 = $.sibling(div, 2);

	{
		const children = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;
			const xBandwidth = $.derived(() => context().xScale.bandwidth?.() ?? 0);
			const yBandwidth = $.derived(() => context().yScale.bandwidth?.() ?? 0);
			var fragment_3 = root();
			var node_5 = $.first_child(fragment_3);

			Layer(node_5, {
				children: ($$anchor, $$slotProps) => {
					var fragment_4 = root_1();
					var node_6 = $.first_child(fragment_4);

					Axis(node_6, { placement: 'top' });

					var node_7 = $.sibling(node_6, 2);

					{
						var consequent = ($$anchor) => {
							Axis($$anchor, { placement: 'left' });
						};

						$.if(node_7, ($$render) => {
							if ($.get(splitByYear)) $$render(consequent);
						});
					}

					var node_8 = $.sibling(node_7, 2);

					{
						const children = ($$anchor, $$arg0) => {
							let nodes = () => ($$arg0?.()).nodes;
							var fragment_6 = $.comment();
							var node_9 = $.first_child(fragment_6);

							$.each(node_9, 17, nodes, $.index, ($$anchor, node) => {
								{
									let $0 = $.derived(() => Number(context().rGet($.get(node))));
									let $1 = $.derived(() => context().cScale?.($.get(node).year));

									Circle($$anchor, {
										get cx() {
											return $.get(node).x;
										},

										get cy() {
											return $.get(node).y;
										},

										get r() {
											return $.get($0);
										},

										get fill() {
											return $.get($1);
										},
										fillOpacity: 0.5,
										stroke: 'none',
										onpointermove: (e) => context().tooltip.show(e, $.get(node)),
										get onpointerleave() {
											return context().tooltip.hide;
										}
									});
								}
							});

							$.append($$anchor, fragment_6);
						};

						let $0 = $.derived(() => ({
							x: xForce.x((d) => context().xGet(asAny(d)) + $.get(xBandwidth) / 2),
							y: yForce.y((d) => $.get(splitByYear)
								? Number(context().yGet(asAny(d))) + $.get(yBandwidth) / 2
								: context().height / 2),
							collide: collideForce.radius((d) => Number(context().rGet(asAny(d))) + 1)
						}));

						let $1 = $.derived(() => ({ nodes: $.get(data) }));

						ForceSimulation(node_8, {
							get forces() {
								return $.get($0);
							},

							get data() {
								return $.get($1);
							},

							get alpha() {
								return $.get(alpha);
							},

							set alpha($$value) {
								$.set(alpha, $$value, true);
							},
							children,
							$$slots: { default: true }
						});
					}

					$.append($$anchor, fragment_4);
				},
				$$slots: { default: true }
			});

			var node_10 = $.sibling(node_5, 2);

			{
				const children = ($$anchor, $$arg0) => {
					let data = () => ($$arg0?.()).data;
					var fragment_8 = root();
					var node_11 = $.first_child(fragment_8);

					$.component(node_11, () => Tooltip.Header, ($$anchor, Tooltip_Header) => {
						Tooltip_Header($$anchor, {
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_2 = $.text();

								$.template_effect(() => $.set_text(text_2, data().company));
								$.append($$anchor, text_2);
							},
							$$slots: { default: true }
						});
					});

					var node_12 = $.sibling(node_11, 2);

					$.component(node_12, () => Tooltip.List, ($$anchor, Tooltip_List) => {
						Tooltip_List($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_10 = root_2();
								var node_13 = $.first_child(fragment_10);

								$.component(node_13, () => Tooltip.Item, ($$anchor, Tooltip_Item) => {
									Tooltip_Item($$anchor, {
										label: 'Date',
										get value() {
											return data().date;
										},
										format: 'day'
									});
								});

								var node_14 = $.sibling(node_13, 2);

								$.component(node_14, () => Tooltip.Item, ($$anchor, Tooltip_Item_1) => {
									Tooltip_Item_1($$anchor, {
										label: 'Laid off',
										get value() {
											return data().totalLaidOff;
										},
										format: 'integer'
									});
								});

								var node_15 = $.sibling(node_14, 2);

								$.component(node_15, () => Tooltip.Item, ($$anchor, Tooltip_Item_2) => {
									Tooltip_Item_2($$anchor, {
										label: 'Industry',
										get value() {
											return data().industry;
										}
									});
								});

								var node_16 = $.sibling(node_15, 2);

								$.component(node_16, () => Tooltip.Item, ($$anchor, Tooltip_Item_3) => {
									Tooltip_Item_3($$anchor, {
										label: 'Location',
										get value() {
											return data().location;
										}
									});
								});

								$.append($$anchor, fragment_10);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_8);
				};

				$.component(node_10, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
					Tooltip_Root($$anchor, {
						get context() {
							return context();
						},
						children,
						$$slots: { default: true }
					});
				});
			}

			$.append($$anchor, fragment_3);
		};

		let $0 = $.derived(scaleBand);
		let $1 = $.derived(() => $.get(splitByYear) ? Math.max(400, $.get(years).length * 90) : 400);

		Chart(node_4, {
			get data() {
				return $.get(data);
			},
			x: 'industry',
			get xDomain() {
				return $.get(industries);
			},
			y: 'year',
			get yScale() {
				return $.get($0);
			},
			r: 'totalLaidOff',
			rRange: [2, 14],
			c: 'year',
			get cDomain() {
				return $.get(years);
			},

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
			get height() {
				return $.get($1);
			},
			children,
			$$slots: { default: true }
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}