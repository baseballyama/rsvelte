import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { scaleUtc } from "d3-scale";
import { curveNatural } from "d3-shape";
import { LineChart } from "layerchart";
import * as Card from "$lib/registry/ui/card/index.js";
import * as Chart from "$lib/registry/ui/chart/index.js";

var root = $.from_html(`<button class="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-start even:border-s data-[active=true]:bg-muted/50 sm:border-s sm:border-t-0 sm:px-8 sm:py-6"><span class="text-xs text-muted-foreground"> </span> <span class="text-lg leading-none font-bold sm:text-3xl"> </span></button>`);
var root_1 = $.from_html(`<div class="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6"><!> <!></div> <div class="flex"></div>`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function Chart_line_interactive($$anchor, $$props) {
	$.push($$props, true);

	const chartData = [
		{ date: new Date("2024-04-01"), desktop: 222, mobile: 150 },
		{ date: new Date("2024-04-02"), desktop: 97, mobile: 180 },
		{ date: new Date("2024-04-03"), desktop: 167, mobile: 120 },
		{ date: new Date("2024-04-04"), desktop: 242, mobile: 260 },
		{ date: new Date("2024-04-05"), desktop: 373, mobile: 290 },
		{ date: new Date("2024-04-06"), desktop: 301, mobile: 340 },
		{ date: new Date("2024-04-07"), desktop: 245, mobile: 180 },
		{ date: new Date("2024-04-08"), desktop: 409, mobile: 320 },
		{ date: new Date("2024-04-09"), desktop: 59, mobile: 110 },
		{ date: new Date("2024-04-10"), desktop: 261, mobile: 190 },
		{ date: new Date("2024-04-11"), desktop: 327, mobile: 350 },
		{ date: new Date("2024-04-12"), desktop: 292, mobile: 210 },
		{ date: new Date("2024-04-13"), desktop: 342, mobile: 380 },
		{ date: new Date("2024-04-14"), desktop: 137, mobile: 220 },
		{ date: new Date("2024-04-15"), desktop: 120, mobile: 170 },
		{ date: new Date("2024-04-16"), desktop: 138, mobile: 190 },
		{ date: new Date("2024-04-17"), desktop: 446, mobile: 360 },
		{ date: new Date("2024-04-18"), desktop: 364, mobile: 410 },
		{ date: new Date("2024-04-19"), desktop: 243, mobile: 180 },
		{ date: new Date("2024-04-20"), desktop: 89, mobile: 150 },
		{ date: new Date("2024-04-21"), desktop: 137, mobile: 200 },
		{ date: new Date("2024-04-22"), desktop: 224, mobile: 170 },
		{ date: new Date("2024-04-23"), desktop: 138, mobile: 230 },
		{ date: new Date("2024-04-24"), desktop: 387, mobile: 290 },
		{ date: new Date("2024-04-25"), desktop: 215, mobile: 250 },
		{ date: new Date("2024-04-26"), desktop: 75, mobile: 130 },
		{ date: new Date("2024-04-27"), desktop: 383, mobile: 420 },
		{ date: new Date("2024-04-28"), desktop: 122, mobile: 180 },
		{ date: new Date("2024-04-29"), desktop: 315, mobile: 240 },
		{ date: new Date("2024-04-30"), desktop: 454, mobile: 380 },
		{ date: new Date("2024-05-01"), desktop: 165, mobile: 220 },
		{ date: new Date("2024-05-02"), desktop: 293, mobile: 310 },
		{ date: new Date("2024-05-03"), desktop: 247, mobile: 190 },
		{ date: new Date("2024-05-04"), desktop: 385, mobile: 420 },
		{ date: new Date("2024-05-05"), desktop: 481, mobile: 390 },
		{ date: new Date("2024-05-06"), desktop: 498, mobile: 520 },
		{ date: new Date("2024-05-07"), desktop: 388, mobile: 300 },
		{ date: new Date("2024-05-08"), desktop: 149, mobile: 210 },
		{ date: new Date("2024-05-09"), desktop: 227, mobile: 180 },
		{ date: new Date("2024-05-10"), desktop: 293, mobile: 330 },
		{ date: new Date("2024-05-11"), desktop: 335, mobile: 270 },
		{ date: new Date("2024-05-12"), desktop: 197, mobile: 240 },
		{ date: new Date("2024-05-13"), desktop: 197, mobile: 160 },
		{ date: new Date("2024-05-14"), desktop: 448, mobile: 490 },
		{ date: new Date("2024-05-15"), desktop: 473, mobile: 380 },
		{ date: new Date("2024-05-16"), desktop: 338, mobile: 400 },
		{ date: new Date("2024-05-17"), desktop: 499, mobile: 420 },
		{ date: new Date("2024-05-18"), desktop: 315, mobile: 350 },
		{ date: new Date("2024-05-19"), desktop: 235, mobile: 180 },
		{ date: new Date("2024-05-20"), desktop: 177, mobile: 230 },
		{ date: new Date("2024-05-21"), desktop: 82, mobile: 140 },
		{ date: new Date("2024-05-22"), desktop: 81, mobile: 120 },
		{ date: new Date("2024-05-23"), desktop: 252, mobile: 290 },
		{ date: new Date("2024-05-24"), desktop: 294, mobile: 220 },
		{ date: new Date("2024-05-25"), desktop: 201, mobile: 250 },
		{ date: new Date("2024-05-26"), desktop: 213, mobile: 170 },
		{ date: new Date("2024-05-27"), desktop: 420, mobile: 460 },
		{ date: new Date("2024-05-28"), desktop: 233, mobile: 190 },
		{ date: new Date("2024-05-29"), desktop: 78, mobile: 130 },
		{ date: new Date("2024-05-30"), desktop: 340, mobile: 280 },
		{ date: new Date("2024-05-31"), desktop: 178, mobile: 230 },
		{ date: new Date("2024-06-01"), desktop: 178, mobile: 200 },
		{ date: new Date("2024-06-02"), desktop: 470, mobile: 410 },
		{ date: new Date("2024-06-03"), desktop: 103, mobile: 160 },
		{ date: new Date("2024-06-04"), desktop: 439, mobile: 380 },
		{ date: new Date("2024-06-05"), desktop: 88, mobile: 140 },
		{ date: new Date("2024-06-06"), desktop: 294, mobile: 250 },
		{ date: new Date("2024-06-07"), desktop: 323, mobile: 370 },
		{ date: new Date("2024-06-08"), desktop: 385, mobile: 320 },
		{ date: new Date("2024-06-09"), desktop: 438, mobile: 480 },
		{ date: new Date("2024-06-10"), desktop: 155, mobile: 200 },
		{ date: new Date("2024-06-11"), desktop: 92, mobile: 150 },
		{ date: new Date("2024-06-12"), desktop: 492, mobile: 420 },
		{ date: new Date("2024-06-13"), desktop: 81, mobile: 130 },
		{ date: new Date("2024-06-14"), desktop: 426, mobile: 380 },
		{ date: new Date("2024-06-15"), desktop: 307, mobile: 350 },
		{ date: new Date("2024-06-16"), desktop: 371, mobile: 310 },
		{ date: new Date("2024-06-17"), desktop: 475, mobile: 520 },
		{ date: new Date("2024-06-18"), desktop: 107, mobile: 170 },
		{ date: new Date("2024-06-19"), desktop: 341, mobile: 290 },
		{ date: new Date("2024-06-20"), desktop: 408, mobile: 450 },
		{ date: new Date("2024-06-21"), desktop: 169, mobile: 210 },
		{ date: new Date("2024-06-22"), desktop: 317, mobile: 270 },
		{ date: new Date("2024-06-23"), desktop: 480, mobile: 530 },
		{ date: new Date("2024-06-24"), desktop: 132, mobile: 180 },
		{ date: new Date("2024-06-25"), desktop: 141, mobile: 190 },
		{ date: new Date("2024-06-26"), desktop: 434, mobile: 380 },
		{ date: new Date("2024-06-27"), desktop: 448, mobile: 490 },
		{ date: new Date("2024-06-28"), desktop: 149, mobile: 200 },
		{ date: new Date("2024-06-29"), desktop: 103, mobile: 160 },
		{ date: new Date("2024-06-30"), desktop: 446, mobile: 400 }
	];

	const chartConfig = {
		views: { label: "Page Views", color: "" },
		desktop: { label: "Desktop", color: "var(--chart-1)" },
		mobile: { label: "Mobile", color: "var(--chart-2)" }
	};

	let activeChart = $.state("desktop");

	const total = $.derived(() => ({
		desktop: chartData.reduce((acc, curr) => acc + curr.desktop, 0),
		mobile: chartData.reduce((acc, curr) => acc + curr.mobile, 0)
	}));

	const activeSeries = $.derived(() => [
		{
			key: $.get(activeChart),
			label: chartConfig[$.get(activeChart)].label,
			color: chartConfig[$.get(activeChart)].color
		}
	]);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Card.Root, ($$anchor, Card_Root) => {
		Card_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_2();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Card.Header, ($$anchor, Card_Header) => {
					Card_Header($$anchor, {
						class: 'flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row',
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root_1();
							var div = $.first_child(fragment_2);
							var node_2 = $.child(div);

							$.component(node_2, () => Card.Title, ($$anchor, Card_Title) => {
								Card_Title($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('Line Chart - Interactive');

										$.append($$anchor, text);
									},
									$$slots: { default: true }
								});
							});

							var node_3 = $.sibling(node_2, 2);

							$.component(node_3, () => Card.Description, ($$anchor, Card_Description) => {
								Card_Description($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_1 = $.text('Showing total visitors for the last 3 months');

										$.append($$anchor, text_1);
									},
									$$slots: { default: true }
								});
							});

							$.reset(div);

							var div_1 = $.sibling(div, 2);

							$.each(div_1, 20, () => ["desktop", "mobile"], (key) => key, ($$anchor, key) => {
								const chart = $.derived(() => key);
								var button = root();
								var span = $.child(button);
								var text_2 = $.only_child(span, true);
								var span_1 = $.sibling(span, 2);
								var text_3 = $.only_child(span_1, true);

								$.reset(button);

								$.template_effect(
									($0) => {
										$.set_attribute(button, 'data-active', $.get(activeChart) === $.get(chart));
										$.set_text(text_2, chartConfig[$.get(chart)].label);
										$.set_text(text_3, $0);
									},
									[() => $.get(total)[key].toLocaleString()]
								);

								$.delegated('click', button, () => $.set(activeChart, $.get(chart), true));
								$.append($$anchor, button);
							});

							$.reset(div_1);
							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				var node_4 = $.sibling(node_1, 2);

				$.component(node_4, () => Card.Content, ($$anchor, Card_Content) => {
					Card_Content($$anchor, {
						class: 'px-2 sm:p-6',
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = $.comment();
							var node_5 = $.first_child(fragment_3);

							$.component(node_5, () => Chart.Container, ($$anchor, Chart_Container) => {
								Chart_Container($$anchor, {
									get config() {
										return chartConfig;
									},
									class: 'aspect-auto h-[250px] w-full',
									children: ($$anchor, $$slotProps) => {
										{
											const tooltip = ($$anchor) => {
												var fragment_5 = $.comment();
												var node_6 = $.first_child(fragment_5);

												$.component(node_6, () => Chart.Tooltip, ($$anchor, Chart_Tooltip) => {
													Chart_Tooltip($$anchor, { hideLabel: true });
												});

												$.append($$anchor, fragment_5);
											};

											let $0 = $.derived(scaleUtc);

											let $1 = $.derived(() => ({
												spline: { curve: curveNatural, motion: "tween", strokeWidth: 2 },
												xAxis: {
													format: (v) => {
														return v.toLocaleDateString("en-US", { month: "short", day: "numeric" });
													}
												},
												highlight: { points: { r: 4 } }
											}));

											LineChart($$anchor, {
												get data() {
													return chartData;
												},
												x: 'date',
												get xScale() {
													return $.get($0);
												},
												axis: 'x',
												get series() {
													return $.get(activeSeries);
												},

												get props() {
													return $.get($1);
												},
												tooltip,
												$$slots: { tooltip: true }
											});
										}
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);