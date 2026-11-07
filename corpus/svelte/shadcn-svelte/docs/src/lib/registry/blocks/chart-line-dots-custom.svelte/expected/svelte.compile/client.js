import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import GitCommitVerticalIcon from "@lucide/svelte/icons/git-commit-vertical";
import TrendingUpIcon from "@lucide/svelte/icons/trending-up";
import { scaleUtc } from "d3-scale";
import { curveNatural } from "d3-shape";
import { LineChart, Points } from "layerchart";
import * as Card from "$lib/registry/ui/card/index.js";
import * as Chart from "$lib/registry/ui/chart/index.js";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="flex w-full items-start gap-2 text-sm"><div class="grid gap-2"><div class="flex items-center gap-2 leading-none font-medium">Trending up by 5.2% this month <!></div> <div class="flex items-center gap-2 leading-none text-muted-foreground">January - June 2024</div></div></div>`);
var root_2 = $.from_html(`<!> <!> <!>`, 1);

export default function Chart_line_dots_custom($$anchor, $$props) {
	$.push($$props, true);

	const chartData = [
		{ date: new Date("2024-01-01"), desktop: 186 },
		{ date: new Date("2024-02-01"), desktop: 305 },
		{ date: new Date("2024-03-01"), desktop: 237 },
		{ date: new Date("2024-04-01"), desktop: 73 },
		{ date: new Date("2024-05-01"), desktop: 209 },
		{ date: new Date("2024-06-01"), desktop: 214 }
	];

	const chartConfig = { desktop: { label: "Desktop", color: "var(--chart-1)" } };
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Card.Root, ($$anchor, Card_Root) => {
		Card_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_2();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Card.Header, ($$anchor, Card_Header) => {
					Card_Header($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root();
							var node_2 = $.first_child(fragment_2);

							$.component(node_2, () => Card.Title, ($$anchor, Card_Title) => {
								Card_Title($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('Line Chart - Dots Custom');

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

										var text_1 = $.text('Showing total visitors for the last 6 months');

										$.append($$anchor, text_1);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				var node_4 = $.sibling(node_1, 2);

				$.component(node_4, () => Card.Content, ($$anchor, Card_Content) => {
					Card_Content($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = $.comment();
							var node_5 = $.first_child(fragment_3);

							$.component(node_5, () => Chart.Container, ($$anchor, Chart_Container) => {
								Chart_Container($$anchor, {
									get config() {
										return chartConfig;
									},

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

											const points = ($$anchor, $$arg0) => {
												let context = () => ($$arg0?.()).context;
												var fragment_6 = $.comment();
												var node_7 = $.first_child(fragment_6);

												$.each(node_7, 17, () => context().series.visibleSeries, (s) => s.key, ($$anchor, s) => {
													{
														const children = ($$anchor, $$arg0) => {
															let points = () => ($$arg0?.()).points;
															var fragment_8 = $.comment();
															var node_8 = $.first_child(fragment_8);

															$.each(node_8, 17, points, $.index, ($$anchor, p) => {
																const r = $.derived(() => 24);

																{
																	let $0 = $.derived(() => $.get(p).x - $.get(r) / 2);
																	let $1 = $.derived(() => $.get(p).y - $.get(r) / 2);

																	GitCommitVerticalIcon($$anchor, {
																		get x() {
																			return $.get($0);
																		},

																		get y() {
																			return $.get($1);
																		},
																		width: $.get(r),
																		height: $.get(r),
																		fill: 'var(--background)',
																		color: 'var(--color-desktop)'
																	});
																}
															});

															$.append($$anchor, fragment_8);
														};

														Points($$anchor, $.spread_props(
															{
																get seriesKey() {
																	return $.get(s).key;
																}
															},
															() => $.get(s).props,
															{ children, $$slots: { default: true } }
														));
													}
												});

												$.append($$anchor, fragment_6);
											};

											let $0 = $.derived(scaleUtc);

											let $1 = $.derived(() => [
												{
													key: "desktop",
													label: "Desktop",
													color: chartConfig.desktop.color
												}
											]);

											let $2 = $.derived(() => ({
												spline: { curve: curveNatural, motion: "tween", strokeWidth: 2 },
												highlight: { points: { motion: "none", r: 3 } },
												xAxis: {
													format: (v) => v.toLocaleDateString("en-US", { month: "short" })
												}
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
													return $.get($1);
												},

												get props() {
													return $.get($2);
												},
												tooltip,
												points,
												$$slots: { tooltip: true, points: true }
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

				var node_9 = $.sibling(node_4, 2);

				$.component(node_9, () => Card.Footer, ($$anchor, Card_Footer) => {
					Card_Footer($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var div = root_1();
							var div_1 = $.child(div);
							var div_2 = $.child(div_1);
							var node_10 = $.sibling($.child(div_2));

							TrendingUpIcon(node_10, { class: 'size-4' });
							$.reset(div_2);
							$.next(2);
							$.reset(div_1);
							$.reset(div);
							$.append($$anchor, div);
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