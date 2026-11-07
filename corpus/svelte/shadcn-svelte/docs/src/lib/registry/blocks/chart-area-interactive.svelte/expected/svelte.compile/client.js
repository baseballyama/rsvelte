import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { scaleUtc } from "d3-scale";
import { curveNatural } from "d3-shape";
import { Area, AreaChart, ChartClipPath } from "layerchart";
import { cubicInOut } from "svelte/easing";
import * as Card from "$lib/registry/ui/card/index.js";
import * as Chart from "$lib/registry/ui/chart/index.js";
import * as Select from "$lib/registry/ui/select/index.js";
import ChartContainer from "../ui/chart/chart-container.svelte";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<div class="grid flex-1 gap-1 text-center sm:text-start"><!> <!></div> <!>`, 1);
var root_3 = $.from_svg(`<defs><linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stop-color="var(--color-desktop)"></stop><stop offset="95%" stop-color="var(--color-desktop)"></stop></linearGradient><linearGradient id="fillMobile" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stop-color="var(--color-mobile)"></stop><stop offset="95%" stop-color="var(--color-mobile)"></stop></linearGradient></defs><!>`, 1);

export default function Chart_area_interactive($$anchor, $$props) {
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

	let timeRange = $.state("90d");

	const selectedLabel = $.derived(() => {
		switch ($.get(timeRange)) {
			case "90d":
				return "Last 3 months";

			case "30d":
				return "Last 30 days";

			case "7d":
				return "Last 7 days";

			default:
				return "Last 3 months";
		}
	});

	const filteredData = $.derived(() => chartData.filter((item) => {
		// eslint-disable-next-line svelte/prefer-svelte-reactivity
		const referenceDate = new Date("2024-06-30");

		let daysToSubtract = 90;

		if ($.get(timeRange) === "30d") {
			daysToSubtract = 30;
		} else if ($.get(timeRange) === "7d") {
			daysToSubtract = 7;
		}

		referenceDate.setDate(referenceDate.getDate() - daysToSubtract);

		return item.date >= referenceDate;
	}));

	const chartConfig = {
		desktop: { label: "Desktop", color: "var(--chart-1)" },
		mobile: { label: "Mobile", color: "var(--chart-2)" }
	};

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Card.Root, ($$anchor, Card_Root) => {
		Card_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_1();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Card.Header, ($$anchor, Card_Header) => {
					Card_Header($$anchor, {
						class: 'flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row',
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root_2();
							var div = $.first_child(fragment_2);
							var node_2 = $.child(div);

							$.component(node_2, () => Card.Title, ($$anchor, Card_Title) => {
								Card_Title($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('Area Chart - Interactive');

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

							var node_4 = $.sibling(div, 2);

							$.component(node_4, () => Select.Root, ($$anchor, Select_Root) => {
								Select_Root($$anchor, {
									type: 'single',
									get value() {
										return $.get(timeRange);
									},

									set value($$value) {
										$.set(timeRange, $$value, true);
									},

									children: ($$anchor, $$slotProps) => {
										var fragment_3 = root_1();
										var node_5 = $.first_child(fragment_3);

										$.component(node_5, () => Select.Trigger, ($$anchor, Select_Trigger) => {
											Select_Trigger($$anchor, {
												class: 'w-40 rounded-lg sm:ms-auto',
												'aria-label': 'Select a value',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_2 = $.text();

													$.template_effect(() => $.set_text(text_2, $.get(selectedLabel)));
													$.append($$anchor, text_2);
												},
												$$slots: { default: true }
											});
										});

										var node_6 = $.sibling(node_5, 2);

										$.component(node_6, () => Select.Content, ($$anchor, Select_Content) => {
											Select_Content($$anchor, {
												class: 'rounded-xl',
												children: ($$anchor, $$slotProps) => {
													var fragment_5 = root();
													var node_7 = $.first_child(fragment_5);

													$.component(node_7, () => Select.Item, ($$anchor, Select_Item) => {
														Select_Item($$anchor, {
															value: '90d',
															class: 'rounded-lg',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_3 = $.text('Last 3 months');

																$.append($$anchor, text_3);
															},
															$$slots: { default: true }
														});
													});

													var node_8 = $.sibling(node_7, 2);

													$.component(node_8, () => Select.Item, ($$anchor, Select_Item_1) => {
														Select_Item_1($$anchor, {
															value: '30d',
															class: 'rounded-lg',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_4 = $.text('Last 30 days');

																$.append($$anchor, text_4);
															},
															$$slots: { default: true }
														});
													});

													var node_9 = $.sibling(node_8, 2);

													$.component(node_9, () => Select.Item, ($$anchor, Select_Item_2) => {
														Select_Item_2($$anchor, {
															value: '7d',
															class: 'rounded-lg',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_5 = $.text('Last 7 days');

																$.append($$anchor, text_5);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_5);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_3);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				var node_10 = $.sibling(node_1, 2);

				$.component(node_10, () => Card.Content, ($$anchor, Card_Content) => {
					Card_Content($$anchor, {
						children: ($$anchor, $$slotProps) => {
							ChartContainer($$anchor, {
								get config() {
									return chartConfig;
								},
								class: '-ml-3 aspect-auto h-[250px] w-full',
								children: ($$anchor, $$slotProps) => {
									{
										const marks = ($$anchor, $$arg0) => {
											let context = () => ($$arg0?.()).context;
											var fragment_8 = root_3();
											var defs = $.first_child(fragment_8);
											var linearGradient = $.child(defs);
											var stop = $.child(linearGradient);

											$.set_attribute(stop, 'stop-opacity', 1.0);

											var stop_1 = $.sibling(stop);

											$.set_attribute(stop_1, 'stop-opacity', 0.1);
											$.reset(linearGradient);

											var linearGradient_1 = $.sibling(linearGradient);
											var stop_2 = $.child(linearGradient_1);

											$.set_attribute(stop_2, 'stop-opacity', 0.8);

											var stop_3 = $.sibling(stop_2);

											$.set_attribute(stop_3, 'stop-opacity', 0.1);
											$.reset(linearGradient_1);
											$.reset(defs);

											var node_11 = $.sibling(defs);

											{
												let $0 = $.derived(() => ({ width: { type: "tween", duration: 1000, easing: cubicInOut } }));

												ChartClipPath(node_11, {
													initialWidth: 0,
													get motion() {
														return $.get($0);
													},

													children: ($$anchor, $$slotProps) => {
														var fragment_9 = $.comment();
														var node_12 = $.first_child(fragment_9);

														$.each(node_12, 17, () => context().series.visibleSeries, (s) => s.key, ($$anchor, s) => {
															{
																let $0 = $.derived(() => $.get(s).key === "desktop" ? "url(#fillDesktop)" : "url(#fillMobile)");

																Area($$anchor, $.spread_props(
																	{
																		get seriesKey() {
																			return $.get(s).key;
																		},

																		get curve() {
																			return curveNatural;
																		},
																		fillOpacity: 0.4,
																		line: { class: "stroke-1" },
																		motion: 'tween'
																	},
																	() => $.get(s).props,
																	{
																		get fill() {
																			return $.get($0);
																		}
																	}
																));
															}
														});

														$.append($$anchor, fragment_9);
													},
													$$slots: { default: true }
												});
											}

											$.append($$anchor, fragment_8);
										};

										const tooltip = ($$anchor) => {
											var fragment_11 = $.comment();
											var node_13 = $.first_child(fragment_11);

											$.component(node_13, () => Chart.Tooltip, ($$anchor, Chart_Tooltip) => {
												Chart_Tooltip($$anchor, {
													labelFormatter: (v) => {
														return v.toLocaleDateString("en-US", { month: "long" });
													},
													indicator: 'line'
												});
											});

											$.append($$anchor, fragment_11);
										};

										let $0 = $.derived(scaleUtc);

										let $1 = $.derived(() => [
											{
												key: "mobile",
												label: "Mobile",
												color: chartConfig.mobile.color
											},

											{
												key: "desktop",
												label: "Desktop",
												color: chartConfig.desktop.color
											}
										]);

										let $2 = $.derived(() => ({
											xAxis: {
												ticks: $.get(timeRange) === "7d" ? 7 : undefined,
												format: (v) => {
													return v.toLocaleDateString("en-US", { month: "short", day: "numeric" });
												}
											},
											yAxis: { format: () => "" }
										}));

										AreaChart($$anchor, {
											legend: true,
											get data() {
												return $.get(filteredData);
											},
											x: 'date',
											get xScale() {
												return $.get($0);
											},

											get series() {
												return $.get($1);
											},
											seriesLayout: 'stack',
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