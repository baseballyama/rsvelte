import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TrendingUpIcon from "@lucide/svelte/icons/trending-up";
import { scaleBand } from "d3-scale";
import { Bar, BarChart } from "layerchart";
import * as Card from "$lib/registry/ui/card/index.js";
import * as Chart from "$lib/registry/ui/chart/index.js";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="flex w-full items-start gap-2 text-sm"><div class="grid gap-2"><div class="flex items-center gap-2 leading-none font-medium">Trending up by 5.2% this month <!></div> <div class="flex items-center gap-2 leading-none text-muted-foreground">Showing total visitors for the last 6 months</div></div></div>`);
var root_2 = $.from_html(`<!> <!> <!>`, 1);

export default function Chart_bar_active($$anchor, $$props) {
	$.push($$props, true);

	const chartData = [
		{
			browser: "chrome",
			visitors: 187,
			color: "var(--color-chrome)"
		},

		{
			browser: "safari",
			visitors: 200,
			color: "var(--color-safari)"
		},

		{
			browser: "firefox",
			visitors: 275,
			color: "var(--color-firefox)"
		},
		{ browser: "edge", visitors: 173, color: "var(--color-edge)" },
		{ browser: "other", visitors: 90, color: "var(--color-other)" }
	];

	const chartConfig = {
		visitors: { label: "Visitors" },
		chrome: { label: "Chrome", color: "var(--chart-1)" },
		safari: { label: "Safari", color: "var(--chart-2)" },
		firefox: { label: "Firefox", color: "var(--chart-3)" },
		edge: { label: "Edge", color: "var(--chart-4)" },
		other: { label: "Other", color: "var(--chart-5)" }
	};

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

										var text = $.text('Bar Chart - Active');

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

										var text_1 = $.text('January - June 2024');

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
													Chart_Tooltip($$anchor, { hideLabel: true, nameKey: 'visitors' });
												});

												$.append($$anchor, fragment_5);
											};

											const marks = ($$anchor, $$arg0) => {
												let context = () => ($$arg0?.()).context;
												const s = $.derived(() => context().series.visibleSeries[0]);
												var fragment_6 = $.comment();
												var node_7 = $.first_child(fragment_6);

												$.each(node_7, 17, () => chartData, $.index, ($$anchor, data, i) => {
													var fragment_7 = $.comment();
													var node_8 = $.first_child(fragment_7);

													{
														var consequent = ($$anchor) => {
															Bar($$anchor, $.spread_props(
																{
																	get seriesKey() {
																		return $.get(s).key;
																	}
																},
																() => $.get(s).props,
																{
																	rounded: 'all',
																	radius: 8,
																	motion: 'tween',
																	get fill() {
																		return $.get(data).color;
																	},

																	get data() {
																		return $.get(data);
																	},
																	fillOpacity: 0.8,
																	get stroke() {
																		return $.get(data).color;
																	},
																	strokeWidth: 2,
																	'stroke-dasharray': 4,
																	'stroke-dashoffset': 4
																}
															));
														};

														var alternate = ($$anchor) => {
															Bar($$anchor, $.spread_props(
																{
																	get seriesKey() {
																		return $.get(s).key;
																	}
																},
																() => $.get(s).props,
																{
																	rounded: 'all',
																	radius: 8,
																	get fill() {
																		return $.get(data).color;
																	},

																	get data() {
																		return $.get(data);
																	},
																	motion: 'tween'
																}
															));
														};

														$.if(node_8, ($$render) => {
															if (i === 2) $$render(consequent); else $$render(alternate, -1);
														});
													}

													$.append($$anchor, fragment_7);
												});

												$.append($$anchor, fragment_6);
											};

											let $0 = $.derived(() => chartData.map((c) => c.color));
											let $1 = $.derived(() => scaleBand().padding(0.25));

											BarChart($$anchor, {
												get data() {
													return chartData;
												},
												x: 'browser',
												c: 'color',
												y: 'visitors',
												get cRange() {
													return $.get($0);
												},

												get xScale() {
													return $.get($1);
												},
												axis: 'x',
												rule: false,
												props: {
													xAxis: { format: (d) => chartConfig[d].label },
													highlight: { area: { fill: "none" } }
												},
												tooltip,
												marks,
												$$slots: { tooltip: true, marks: true }
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