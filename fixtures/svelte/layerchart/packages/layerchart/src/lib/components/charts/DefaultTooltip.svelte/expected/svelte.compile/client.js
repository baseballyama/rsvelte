import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { sum } from 'd3-array';
import { getChartContext } from '$lib/contexts/chart.js';
import { accessor, chartDataArray, isEqualValue } from '$lib/utils/common.js';
import Root from '../tooltip/Tooltip.svelte';
import Header from '../tooltip/TooltipHeader.svelte';
import List from '../tooltip/TooltipList.svelte';
import Item from '../tooltip/TooltipItem.svelte';
import Separator from '../tooltip/TooltipSeparator.svelte';
import { format } from '@layerstack/utils';

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function DefaultTooltip($$anchor, $$props) {
	$.push($$props, true);

	// Shared tooltip logic across simplified chart components.
	// Use explicit named imports instead of `import * as Tooltip from '../tooltip/index.js'`
	// so this dynamically-imported chunk doesn't drag in `TooltipContext.svelte`
	// (which is already in the static graph via Chart.svelte and would otherwise
	// bloat the lazy chunk and trip Vite dev-server compilation in CI).
	const Tooltip = { Root, Header, List, Item, Separator };

	let canHaveTotal = $.prop($$props, 'canHaveTotal', 3, false);
	const context = getChartContext();

	/**
	 * One row of the tooltip's list.  `seriesKey` is the series it highlights on hover, or `null`
	 * when the item is a sub-band of the data rather than a series.
	 */
	// Get visible series (already in correct order from TooltipContext)
	const visibleSeries = $.derived(() => context.tooltip.series.filter((s) => s.visible));

	/**
	 * The rows the hovered band covers.
	 *
	 * Data-driven sub-bands (`x1` / `y1`) split one band across a row each, holding only that
	 * sub-band's series — so the band's values live across the rows rather than in the single one
	 * the pointer resolved to, and a tooltip for the band has to read all of them.
	 *
	 * A facet panel groups the same way, with the scale inside it as the sub-band, so its rows are
	 * read back off the panel instead of matched on a value.
	 */
	function bandData(data) {
		if (context.facetBand) {
			return context.facet.panels.find((panel) => panel.has(data))?.data ?? [data];
		}

		// Long data stacked by `c` puts several rows in a band with no `x1` to name them — the band
		// is then the category axis itself
		const banded = context.props.x1 != null
			? context.x
			: context.props.y1 != null
				? context.y
				: context.cKey(data) != null
					? context.valueAxis === 'y' ? context.x : context.y
					: null;

		if (!banded) return [data];

		const value = banded(data);

		// Within a facet, only that panel's rows — the same band exists in every panel, so filtering
		// the whole dataset would list the other panels' values here, and total across them
		const source = context.facet.enabled
			? context.facet.panels.find((panel) => panel.has(data))?.data ?? chartDataArray(context.data)
			: chartDataArray(context.data);

		return source.filter((d) => isEqualValue(banded(d), value));
	}

	/**
	 * The series values for the row being shown.
	 *
	 * `Tooltip.Root facetAll` renders one tooltip per facet panel, each for a *different* row, so
	 * the values resolved for the hovered row can't be reused — they're re-read with the same
	 * accessor rule `TooltipContext` uses.
	 */
	function seriesFor(data) {
		const d = bandData(data);

		// Nothing names the sub-bands when the series are implicit — so the band's rows are the items
		// themselves, one per sub-band, labelled by the value that placed them there: `x1` / `y1`
		// within a band, or the band scale itself within a facet panel.
		if (d.length > 1 && context.series.isDefaultSeries) {
			const value = context.valueAxis === 'y' ? context.y : context.x;

			const subBand = context.facetBand
				? context.valueAxis === 'y' ? context.x : context.y
				: context.props.x1 != null
					? context.x1
					: context.props.y1 != null ? context.y1 : context.c;

			return d.map((row, i) => ({
				// The sub-band alone doesn't identify a row when `c` names layers stacked within it —
				// `x1="basket"` with `c="fruit"` puts several fruit in each basket.  Only the `{#each}`
				// key; what's shown comes from `label` / `value` / `color`.
				key: [subBand(row), context.cKey(row) ?? i].join('\u0000'),

				// The rows are sub-bands rather than series — hovering one highlights the `c` category
				// it carries, when the legend names those, and nothing otherwise
				seriesKey: context.cKey(row) ?? null,

				// The category when `c` names one — it's what the colour and the legend already say, and
				// what the equivalent `series` chart lists.  The sub-band otherwise.
				label: context.cKey(row) ?? subBand(row),
				value: value(row),
				color: context.config.c ? context.cGet(row) : undefined
			}));
		}

		const series = d.length === 1 && data === context.tooltip.data
			? $.get(visibleSeries)
			: $.get(visibleSeries).map((s) => {
				const config = s.config;
				const valueAcc = accessor(config?.value ?? (config?.data ? context.props.y ?? context.props.x : config?.key));

				// The first row of the band carrying this series — one row per sub-band, so only one
				// of them holds any given series
				const match = d.find((row) => valueAcc(row) != null);

				return { ...s, value: match != null ? valueAcc(match) : undefined };
			});

		// A series no row holds a value for would render as a label with nothing beside it, which
		// reads as broken rather than as absent.
		return series.filter((s) => s.value != null).map((s) => ({
			key: s.key,
			seriesKey: s.key,
			label: s.label,
			value: s.value,
			color: s.color
		}));
	}

	// Single-point modes find one specific data point (by proximity in both x+y),
	// so the tooltip shows dimensional info (x, y, r) for that point.
	// Multi-series modes find data at a single axis position, showing all series values.
	const isSinglePointMode = $.derived(() => context.tooltip.mode === 'quadtree' || context.tooltip.mode === 'voronoi');

	// For single-point mode: find the active series for the hovered data point
	const activeSeries = $.derived(() => $.get(isSinglePointMode)
		? context.tooltip.series.find((s) => s.key === context.tooltip.data?.seriesKey) ?? context.tooltip.series[0]
		: null);

	/**
	 * The header for the row being shown — the x-axis value (or the y-axis one for horizontal and
	 * vertical charts), or the facet when the panel is the band, since the scale inside it labels
	 * the items instead.
	 *
	 * Taken from the row it's passed for the same reason `seriesFor` is: with `facetAll` each panel
	 * shows a *different* row, and a header read off the hovered one would name that panel in all of
	 * them.
	 */
	function headerLabelFor(data) {
		if (!data) return undefined;

		if (context.facetBand) {
			return context.facet.tooltipLabel(data);
		}

		return context.valueAxis === 'y' ? context.x(data) : context.y(data);
	}

	/**
	 * The panel the row sits in, for charts where the panel *isn't* the band.
	 *
	 * The band value alone names a row in every panel — three panels each have a `Torgersen` — so it
	 * only identifies the row once the panel is in front of it.  Empty when the panel is the band,
	 * since the header is already the facet value there.
	 *
	 * What the panel is called is `facet.tooltip`'s to say, so both paths ask it.
	 */
	function facetLabelFor(data) {
		if (!data || context.facetBand || !context.facet.enabled) return undefined;

		return context.facet.tooltipLabel(data);
	}

	/**
	 * The header with its facet in front, formatted here rather than by `Tooltip.Header` — the band
	 * value still needs its own format applied before anything is joined to it, or a date or a
	 * number would land in the header raw.
	 */
	function facetHeaderLabelFor(data) {
		const facetLabel = facetLabelFor(data);

		return facetLabel != null
			? `${facetLabel} · ${format(headerLabelFor(data), $$props.tooltipProps?.header?.format)}`
			: undefined;
	}

	function isSeriesItemHighlighted(seriesKey) {
		return seriesKey
			? context.series.isHighlighted(seriesKey, true)
			: undefined;
	}

	/**
	 * What hovering the row's items highlights — its `c` category when the legend names those, and
	 * the series the point belongs to otherwise.
	 */
	function activeKey(data) {
		return context.cKey(data) ?? $.get(activeSeries)?.key ?? null;
	}

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		const children = ($$anchor, $$arg0) => {
			let data = () => ($$arg0?.()).data;
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			{
				var consequent_2 = ($$anchor) => {
					var fragment_2 = root_1();
					var node_2 = $.first_child(fragment_2);

					{
						var consequent = ($$anchor) => {
							var fragment_3 = $.comment();
							var node_3 = $.first_child(fragment_3);

							{
								let $0 = $.derived(() => $.get(activeSeries).label ?? $.get(activeSeries).key);

								$.component(node_3, () => Tooltip.Header, ($$anchor, Tooltip_Header) => {
									Tooltip_Header($$anchor, $.spread_props(
										{
											get value() {
												return $.get($0);
											},

											get color() {
												return $.get(activeSeries).color;
											}
										},
										() => $$props.tooltipProps?.header
									));
								});
							}

							$.append($$anchor, fragment_3);
						};

						$.if(node_2, ($$render) => {
							if ($.get(activeSeries) && $.get(activeSeries).key !== 'default') $$render(consequent);
						});
					}

					var node_4 = $.sibling(node_2, 2);

					$.component(node_4, () => Tooltip.List, ($$anchor, Tooltip_List) => {
						Tooltip_List($$anchor, $.spread_props(() => $$props.tooltipProps?.list, {
							children: ($$anchor, $$slotProps) => {
								var fragment_4 = root();
								var node_5 = $.first_child(fragment_4);

								{
									let $0 = $.derived(() => typeof context.config.x === 'string' ? context.config.x : 'x');
									let $1 = $.derived(() => context.x(data()));
									let $2 = $.derived(() => isSeriesItemHighlighted(activeKey(data())));

									$.component(node_5, () => Tooltip.Item, ($$anchor, Tooltip_Item) => {
										Tooltip_Item($$anchor, $.spread_props(
											{
												get label() {
													return $.get($0);
												},

												get value() {
													return $.get($1);
												},

												get 'data-highlighted'() {
													return $.get($2);
												},

												get format() {
													return format;
												},
												onpointerenter: () => context.series.highlightKey = activeKey(data()),
												onpointerleave: () => context.series.highlightKey = null
											},
											() => $$props.tooltipProps?.item
										));
									});
								}

								var node_6 = $.sibling(node_5, 2);

								{
									let $0 = $.derived(() => typeof context.config.y === 'string' ? context.config.y : 'y');
									let $1 = $.derived(() => context.y(data()));
									let $2 = $.derived(() => isSeriesItemHighlighted(activeKey(data())));

									$.component(node_6, () => Tooltip.Item, ($$anchor, Tooltip_Item_1) => {
										Tooltip_Item_1($$anchor, $.spread_props(
											{
												get label() {
													return $.get($0);
												},

												get value() {
													return $.get($1);
												},

												get 'data-highlighted'() {
													return $.get($2);
												},

												get format() {
													return format;
												},
												onpointerenter: () => context.series.highlightKey = activeKey(data()),
												onpointerleave: () => context.series.highlightKey = null
											},
											() => $$props.tooltipProps?.item
										));
									});
								}

								var node_7 = $.sibling(node_6, 2);

								{
									var consequent_1 = ($$anchor) => {
										var fragment_5 = $.comment();
										var node_8 = $.first_child(fragment_5);

										{
											let $0 = $.derived(() => typeof context.config.r === 'string' ? context.config.r : 'r');
											let $1 = $.derived(() => context.r(data()));
											let $2 = $.derived(() => isSeriesItemHighlighted(activeKey(data())));

											$.component(node_8, () => Tooltip.Item, ($$anchor, Tooltip_Item_2) => {
												Tooltip_Item_2($$anchor, $.spread_props(
													{
														get label() {
															return $.get($0);
														},

														get value() {
															return $.get($1);
														},

														get 'data-highlighted'() {
															return $.get($2);
														},

														get format() {
															return format;
														},
														onpointerenter: () => context.series.highlightKey = activeKey(data()),
														onpointerleave: () => context.series.highlightKey = null
													},
													() => $$props.tooltipProps?.item
												));
											});
										}

										$.append($$anchor, fragment_5);
									};

									$.if(node_7, ($$render) => {
										if (context.config.r) $$render(consequent_1);
									});
								}

								$.append($$anchor, fragment_4);
							},
							$$slots: { default: true }
						}));
					});

					$.append($$anchor, fragment_2);
				};

				var alternate_1 = ($$anchor) => {
					const facetHeaderLabel = $.derived(() => facetHeaderLabelFor(data()));
					var fragment_6 = root_1();
					var node_9 = $.first_child(fragment_6);

					{
						var consequent_3 = ($$anchor) => {
							var fragment_7 = $.comment();
							var node_10 = $.first_child(fragment_7);

							$.component(node_10, () => Tooltip.Header, ($$anchor, Tooltip_Header_1) => {
								Tooltip_Header_1($$anchor, $.spread_props(() => $$props.tooltipProps?.header, {
									get value() {
										return $.get(facetHeaderLabel);
									},
									format: undefined
								}));
							});

							$.append($$anchor, fragment_7);
						};

						var alternate = ($$anchor) => {
							var fragment_8 = $.comment();
							var node_11 = $.first_child(fragment_8);

							{
								let $0 = $.derived(() => headerLabelFor(data()));

								$.component(node_11, () => Tooltip.Header, ($$anchor, Tooltip_Header_2) => {
									Tooltip_Header_2($$anchor, $.spread_props(
										{
											get value() {
												return $.get($0);
											},

											get format() {
												return format;
											}
										},
										() => $$props.tooltipProps?.header
									));
								});
							}

							$.append($$anchor, fragment_8);
						};

						$.if(node_9, ($$render) => {
							if ($.get(facetHeaderLabel) != null) $$render(consequent_3); else $$render(alternate, -1);
						});
					}

					var node_12 = $.sibling(node_9, 2);

					$.component(node_12, () => Tooltip.List, ($$anchor, Tooltip_List_1) => {
						Tooltip_List_1($$anchor, $.spread_props(() => $$props.tooltipProps?.list, {
							children: ($$anchor, $$slotProps) => {
								var fragment_9 = root_1();
								var node_13 = $.first_child(fragment_9);

								$.each(node_13, 19, () => seriesFor(data()), (s, i) => s.key ?? i, ($$anchor, s) => {
									var fragment_10 = $.comment();
									var node_14 = $.first_child(fragment_10);

									{
										let $0 = $.derived(() => $.get(s).seriesKey != null
											? context.series.isHighlighted($.get(s).seriesKey, true)
											: undefined);

										$.component(node_14, () => Tooltip.Item, ($$anchor, Tooltip_Item_3) => {
											Tooltip_Item_3($$anchor, $.spread_props(
												{
													get label() {
														return $.get(s).label;
													},

													get value() {
														return $.get(s).value;
													},

													get color() {
														return $.get(s).color;
													},

													get 'data-highlighted'() {
														return $.get($0);
													},

													get format() {
														return format;
													},
													valueAlign: 'right',
													onpointerenter: () => context.series.highlightKey = $.get(s).seriesKey,
													onpointerleave: () => context.series.highlightKey = null
												},
												() => $$props.tooltipProps?.item
											));
										});
									}

									$.append($$anchor, fragment_10);
								});

								var node_15 = $.sibling(node_13, 2);

								{
									var consequent_4 = ($$anchor) => {
										var fragment_11 = root_1();
										var node_16 = $.first_child(fragment_11);

										$.component(node_16, () => Tooltip.Separator, ($$anchor, Tooltip_Separator) => {
											Tooltip_Separator($$anchor, $.spread_props(() => $$props.tooltipProps?.separator, { children: undefined }));
										});

										var node_17 = $.sibling(node_16, 2);

										{
											let $0 = $.derived(() => sum(seriesFor(data()), (s) => s.value ?? 0));

											$.component(node_17, () => Tooltip.Item, ($$anchor, Tooltip_Item_4) => {
												Tooltip_Item_4($$anchor, $.spread_props(
													{
														label: 'total',
														get value() {
															return $.get($0);
														},
														format: 'integer',
														valueAlign: 'right'
													},
													() => $$props.tooltipProps?.item
												));
											});
										}

										$.append($$anchor, fragment_11);
									};

									var d_1 = $.derived(() => canHaveTotal() && seriesFor(data()).length > 1 && !$$props.tooltipProps?.hideTotal);

									$.if(node_15, ($$render) => {
										if ($.get(d_1)) $$render(consequent_4);
									});
								}

								$.append($$anchor, fragment_9);
							},
							$$slots: { default: true }
						}));
					});

					$.append($$anchor, fragment_6);
				};

				$.if(node_1, ($$render) => {
					if ($.get(isSinglePointMode)) $$render(consequent_2); else $$render(alternate_1, -1);
				});
			}

			$.append($$anchor, fragment_1);
		};

		$.component(node, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
			Tooltip_Root($$anchor, $.spread_props(
				{
					get context() {
						return context;
					}
				},
				() => $$props.tooltipProps?.root,
				{ children, $$slots: { default: true } }
			));
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}