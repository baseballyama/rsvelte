import * as $ from 'svelte/internal/server';
import { sum } from 'd3-array';
import { getChartContext } from '$lib/contexts/chart.js';
import { accessor, chartDataArray, isEqualValue } from '$lib/utils/common.js';
import Root from '../tooltip/Tooltip.svelte';
import Header from '../tooltip/TooltipHeader.svelte';
import List from '../tooltip/TooltipList.svelte';
import Item from '../tooltip/TooltipItem.svelte';
import Separator from '../tooltip/TooltipSeparator.svelte';
import { format } from '@layerstack/utils';

export default function DefaultTooltip($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// Shared tooltip logic across simplified chart components.
		// Use explicit named imports instead of `import * as Tooltip from '../tooltip/index.js'`
		// so this dynamically-imported chunk doesn't drag in `TooltipContext.svelte`
		// (which is already in the static graph via Chart.svelte and would otherwise
		// bloat the lazy chunk and trip Vite dev-server compilation in CI).
		const Tooltip = { Root, Header, List, Item, Separator };

		let { tooltipProps, canHaveTotal = false } = $$props;
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
				? visibleSeries()
				: visibleSeries().map((s) => {
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
		const activeSeries = $.derived(() => isSinglePointMode()
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
				? `${facetLabel} · ${format(headerLabelFor(data), tooltipProps?.header?.format)}`
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
			return context.cKey(data) ?? activeSeries()?.key ?? null;
		}

		{
			function children($$renderer, { data }) {
				if (isSinglePointMode()) {
					$$renderer.push('<!--[0-->');

					if (activeSeries() && activeSeries().key !== 'default') {
						$$renderer.push('<!--[0-->');

						if (Tooltip.Header) {
							$$renderer.push('<!--[-->');

							Tooltip.Header($$renderer, $.spread_props([
								{
									value: activeSeries().label ?? activeSeries().key,
									color: activeSeries().color
								},
								tooltipProps?.header
							]));

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> `);

					if (Tooltip.List) {
						$$renderer.push('<!--[-->');

						Tooltip.List($$renderer, $.spread_props([
							tooltipProps?.list,
							{
								children: ($$renderer) => {
									if (Tooltip.Item) {
										$$renderer.push('<!--[-->');

										Tooltip.Item($$renderer, $.spread_props([
											{
												label: typeof context.config.x === 'string' ? context.config.x : 'x',
												value: context.x(data),
												'data-highlighted': isSeriesItemHighlighted(activeKey(data)),
												format,
												onpointerenter: () => context.series.highlightKey = activeKey(data),
												onpointerleave: () => context.series.highlightKey = null
											},
											tooltipProps?.item
										]));

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (Tooltip.Item) {
										$$renderer.push('<!--[-->');

										Tooltip.Item($$renderer, $.spread_props([
											{
												label: typeof context.config.y === 'string' ? context.config.y : 'y',
												value: context.y(data),
												'data-highlighted': isSeriesItemHighlighted(activeKey(data)),
												format,
												onpointerenter: () => context.series.highlightKey = activeKey(data),
												onpointerleave: () => context.series.highlightKey = null
											},
											tooltipProps?.item
										]));

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (context.config.r) {
										$$renderer.push('<!--[0-->');

										if (Tooltip.Item) {
											$$renderer.push('<!--[-->');

											Tooltip.Item($$renderer, $.spread_props([
												{
													label: typeof context.config.r === 'string' ? context.config.r : 'r',
													value: context.r(data),
													'data-highlighted': isSeriesItemHighlighted(activeKey(data)),
													format,
													onpointerenter: () => context.series.highlightKey = activeKey(data),
													onpointerleave: () => context.series.highlightKey = null
												},
												tooltipProps?.item
											]));

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}
									} else {
										$$renderer.push('<!--[-1-->');
									}

									$$renderer.push(`<!--]-->`);
								},
								$$slots: { default: true }
							}
						]));

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				} else {
					$$renderer.push('<!--[-1-->');

					const facetHeaderLabel = facetHeaderLabelFor(data);

					if (facetHeaderLabel != null) {
						$$renderer.push('<!--[0-->');

						if (Tooltip.Header) {
							$$renderer.push('<!--[-->');

							Tooltip.Header($$renderer, $.spread_props([
								tooltipProps?.header,
								{ value: facetHeaderLabel, format: undefined }
							]));

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					} else {
						$$renderer.push('<!--[-1-->');

						if (Tooltip.Header) {
							$$renderer.push('<!--[-->');

							Tooltip.Header($$renderer, $.spread_props([
								{ value: headerLabelFor(data), format },
								tooltipProps?.header
							]));

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					}

					$$renderer.push(`<!--]--> `);

					if (Tooltip.List) {
						$$renderer.push('<!--[-->');

						Tooltip.List($$renderer, $.spread_props([
							tooltipProps?.list,
							{
								children: ($$renderer) => {
									$$renderer.push(`<!--[-->`);

									const each_array = $.ensure_array_like(seriesFor(data));

									for (let i = 0, $$length = each_array.length; i < $$length; i++) {
										let s = each_array[i];

										if (Tooltip.Item) {
											$$renderer.push('<!--[-->');

											Tooltip.Item($$renderer, $.spread_props([
												{
													label: s.label,
													value: s.value,
													color: s.color,
													'data-highlighted': s.seriesKey != null
														? context.series.isHighlighted(s.seriesKey, true)
														: undefined,
													format,
													valueAlign: 'right',
													onpointerenter: () => context.series.highlightKey = s.seriesKey,
													onpointerleave: () => context.series.highlightKey = null
												},
												tooltipProps?.item
											]));

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}
									}

									$$renderer.push(`<!--]--> `);

									if (canHaveTotal && seriesFor(data).length > 1 && !tooltipProps?.hideTotal) {
										$$renderer.push('<!--[0-->');

										if (Tooltip.Separator) {
											$$renderer.push('<!--[-->');
											Tooltip.Separator($$renderer, $.spread_props([tooltipProps?.separator, { children: undefined }]));
											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (Tooltip.Item) {
											$$renderer.push('<!--[-->');

											Tooltip.Item($$renderer, $.spread_props([
												{
													label: 'total',
													value: sum(seriesFor(data), (s) => s.value ?? 0),
													format: 'integer',
													valueAlign: 'right'
												},
												tooltipProps?.item
											]));

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}
									} else {
										$$renderer.push('<!--[-1-->');
									}

									$$renderer.push(`<!--]-->`);
								},
								$$slots: { default: true }
							}
						]));

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

				Tooltip.Root($$renderer, $.spread_props([
					{ context },
					tooltipProps?.root,
					{ children, $$slots: { default: true } }
				]));

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		}
	});
}