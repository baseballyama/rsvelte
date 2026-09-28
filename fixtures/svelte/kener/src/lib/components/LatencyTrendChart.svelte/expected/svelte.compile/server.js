import * as $ from 'svelte/internal/server';
import { AreaChart, Area, LinearGradient } from "layerchart";
import { curveCatmullRom } from "d3-shape";
import { scaleTime } from "d3-scale";
import * as Chart from "$lib/components/ui/chart/index.js";
import { t } from "$lib/stores/i18n";
import { ParseLatency } from "$lib/clientTools";
import { formatDate } from "$lib/stores/datetime";
import { page } from "$app/state";

export default function LatencyTrendChart($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		let {
			data,
			label = $.store_get($$store_subs ??= {}, '$t', t)("Avg Latency"),
			height = 128,
			class: className = ""
		} = $$props;

		// Chart config
		let chartConfig = $.derived(() => ({ value: { label, color: "var(--chart-1)" } }));

		// Filter out zero values
		let chartData = $.derived(() => data.filter((d) => d.value > 0));

		$$renderer.push(`<div${$.attr_class(`${$.stringify(className)} `)}>`);

		if (chartData().length > 0) {
			$$renderer.push('<!--[0-->');

			if (Chart.Container) {
				$$renderer.push('<!--[-->');

				Chart.Container($$renderer, {
					config: chartConfig(),
					class: 'w-full',
					style: `height: ${$.stringify(height)}px;`,
					children: ($$renderer) => {
						{
							function marks($$renderer, { series, getAreaProps }) {
								$$renderer.push(`<!--[-->`);

								const each_array = $.ensure_array_like(series);

								for (let i = 0, $$length = each_array.length; i < $$length; i++) {
									let s = each_array[i];

									{
										function children($$renderer, { gradient }) {
											Area($$renderer, $.spread_props([getAreaProps(s, i), { fill: gradient }]));
										}

										LinearGradient($$renderer, {
											stops: [
												s.color ?? "",
												"color-mix(in lch, " + s.color + " 10%, transparent)"
											],
											vertical: true,
											children,
											$$slots: { default: true }
										});
									}
								}

								$$renderer.push(`<!--]-->`);
							}

							function tooltip($$renderer) {
								{
									function formatter($$renderer, { value, name, item }) {
										$$renderer.push(`<div class="flex w-full items-start gap-2"><div${$.attr_style(`--color-bg: ${$.stringify(item.color)}; --color-border: ${$.stringify(item.color)};`)} class="mt-0.5 size-2.5 shrink-0 rounded-[2px] border-(--color-border) bg-(--color-bg)"></div> <div class="flex flex-1 flex-col items-start justify-between gap-1 leading-none"><span class="text-muted-foreground text-xs">${$.escape(item.payload?.date
											? $.store_get($$store_subs ??= {}, '$formatDate', formatDate)(item.payload.date, page.data.dateAndTimeFormat.dateOnly)
											: "")}</span> <div class="flex items-center gap-2"><span class="text-foreground font-mono font-medium tabular-nums">${$.escape(ParseLatency(Number(value)))}</span></div></div></div>`);
									}

									if (Chart.Tooltip) {
										$$renderer.push('<!--[-->');
										Chart.Tooltip($$renderer, { hideLabel: true, formatter, $$slots: { formatter: true } });
										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}
								}
							}

							AreaChart($$renderer, {
								data: chartData(),
								x: 'date',
								xScale: scaleTime(),
								y: 'value',
								yDomain: [0, null],
								yNice: true,
								axis: 'x',
								grid: false,
								series: [{ key: "value", label, color: "var(--color-value)" }],
								props: {
									area: {
										curve: curveCatmullRom,
										"fill-opacity": 0.4,
										line: { class: "stroke-1" }
									},
									xAxis: {
										format: (d) => $.store_get($$store_subs ??= {}, '$formatDate', formatDate)(d, "MMM d")
									}
								},
								marks,
								tooltip,
								$$slots: { marks: true, tooltip: true }
							});
						}
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		} else {
			$$renderer.push(`<!--[-1--><div class="flex items-center justify-center"${$.attr_style(`height: ${$.stringify(height)}px;`)}><p class="text-muted-foreground text-sm">${$.escape($.store_get($$store_subs ??= {}, '$t', t)("No latency data available for this day"))}</p></div>`);
		}

		$$renderer.push(`<!--]--></div>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}