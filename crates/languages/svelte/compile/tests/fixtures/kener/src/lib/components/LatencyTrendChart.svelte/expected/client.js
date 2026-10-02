import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { AreaChart, Area, LinearGradient } from "layerchart";
import { curveCatmullRom } from "d3-shape";
import { scaleTime } from "d3-scale";
import * as Chart from "$lib/components/ui/chart/index.js";
import { t } from "$lib/stores/i18n";
import { ParseLatency } from "$lib/clientTools";
import { formatDate } from "$lib/stores/datetime";
import { page } from "$app/state";

var root = $.from_html(`<div class="flex w-full items-start gap-2"><div class="mt-0.5 size-2.5 shrink-0 rounded-[2px] border-(--color-border) bg-(--color-bg)"></div> <div class="flex flex-1 flex-col items-start justify-between gap-1 leading-none"><span class="text-muted-foreground text-xs"> </span> <div class="flex items-center gap-2"><span class="text-foreground font-mono font-medium tabular-nums"> </span></div></div></div>`);
var root_1 = $.from_html(`<div class="flex items-center justify-center"><p class="text-muted-foreground text-sm"> </p></div>`);
var root_2 = $.from_html(`<div><!></div>`);

export default function LatencyTrendChart($$anchor, $$props) {
	$.push($$props, true);

	const $t = () => $.store_get(t, '$t', $$stores);
	const $formatDate = () => $.store_get(formatDate, '$formatDate', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	let label = $.prop($$props, 'label', 19, () => $t()("Avg Latency")),
		height = $.prop($$props, 'height', 3, 128),
		className = $.prop($$props, 'class', 3, "");

	// Chart config
	let chartConfig = $.derived(() => ({ value: { label: label(), color: "var(--chart-1)" } }));

	// Filter out zero values
	let chartData = $.derived(() => $$props.data.filter((d) => d.value > 0));

	var div = root_2();
	var node = $.child(div);

	{
		var consequent = ($$anchor) => {
			var fragment = $.comment();
			var node_1 = $.first_child(fragment);

			$.component(node_1, () => Chart.Container, ($$anchor, Chart_Container) => {
				Chart_Container($$anchor, {
					get config() {
						return $.get(chartConfig);
					},
					class: 'w-full',
					get style() {
						return `height: ${height() ?? ''}px;`;
					},

					children: ($$anchor, $$slotProps) => {
						{
							const marks = ($$anchor, $$arg0) => {
								let series = () => ($$arg0?.()).series;
								let getAreaProps = () => ($$arg0?.()).getAreaProps;
								var fragment_2 = $.comment();
								var node_2 = $.first_child(fragment_2);

								$.each(node_2, 19, series, (s) => s.key, ($$anchor, s, i) => {
									{
										const children = ($$anchor, $$arg0) => {
											let gradient = () => ($$arg0?.()).gradient;

											{
												let $0 = $.derived(() => getAreaProps()($.get(s), $.get(i)));

												Area($$anchor, $.spread_props(() => $.get($0), {
													get fill() {
														return gradient();
													}
												}));
											}
										};

										let $0 = $.derived(() => [
											$.get(s).color ?? "",
											"color-mix(in lch, " + $.get(s).color + " 10%, transparent)"
										]);

										LinearGradient($$anchor, {
											get stops() {
												return $.get($0);
											},
											vertical: true,
											children,
											$$slots: { default: true }
										});
									}
								});

								$.append($$anchor, fragment_2);
							};

							const tooltip = ($$anchor) => {
								var fragment_5 = $.comment();
								var node_3 = $.first_child(fragment_5);

								{
									const formatter = ($$anchor, $$arg0) => {
										let value = () => ($$arg0?.()).value;
										let name = () => ($$arg0?.()).name;
										let item = () => ($$arg0?.()).item;
										var div_1 = root();
										var div_2 = $.child(div_1);
										var div_3 = $.sibling(div_2, 2);
										var span = $.child(div_3);
										var text = $.only_child(span, true);
										var div_4 = $.sibling(span, 2);
										var span_1 = $.child(div_4);
										var text_1 = $.only_child(span_1, true);

										$.reset(div_4);
										$.reset(div_3);
										$.reset(div_1);

										$.template_effect(
											($0, $1) => {
												$.set_style(div_2, `--color-bg: ${item().color ?? ''}; --color-border: ${item().color ?? ''};`);
												$.set_text(text, $0);
												$.set_text(text_1, $1);
											},
											[
												() => item().payload?.date
													? $formatDate()(item().payload.date, page.data.dateAndTimeFormat.dateOnly)
													: "",
												() => ParseLatency(Number(value()))
											]
										);

										$.append($$anchor, div_1);
									};

									$.component(node_3, () => Chart.Tooltip, ($$anchor, Chart_Tooltip) => {
										Chart_Tooltip($$anchor, { hideLabel: true, formatter, $$slots: { formatter: true } });
									});
								}

								$.append($$anchor, fragment_5);
							};

							let $0 = $.derived(scaleTime);

							let $1 = $.derived(() => [
								{ key: "value", label: label(), color: "var(--color-value)" }
							]);

							let $2 = $.derived(() => ({
								area: {
									curve: curveCatmullRom,
									"fill-opacity": 0.4,
									line: { class: "stroke-1" }
								},
								xAxis: { format: (d) => $formatDate()(d, "MMM d") }
							}));

							AreaChart($$anchor, {
								get data() {
									return $.get(chartData);
								},
								x: 'date',
								get xScale() {
									return $.get($0);
								},
								y: 'value',
								yDomain: [0, null],
								yNice: true,
								axis: 'x',
								grid: false,
								get series() {
									return $.get($1);
								},

								get props() {
									return $.get($2);
								},
								marks,
								tooltip,
								$$slots: { marks: true, tooltip: true }
							});
						}
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment);
		};

		var alternate = ($$anchor) => {
			var div_5 = root_1();
			var p = $.child(div_5);
			var text_2 = $.only_child(p, true);

			$.reset(div_5);

			$.template_effect(
				($0) => {
					$.set_style(div_5, `height: ${height() ?? ''}px;`);
					$.set_text(text_2, $0);
				},
				[() => $t()("No latency data available for this day")]
			);

			$.append($$anchor, div_5);
		};

		$.if(node, ($$render) => {
			if ($.get(chartData).length > 0) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(div);
	$.template_effect(() => $.set_class(div, 1, `${className() ?? ''}  `));
	$.append($$anchor, div);
	$.pop();
	$$cleanup();
}