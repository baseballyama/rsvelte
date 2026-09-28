import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { scaleBand } from "d3-scale";
import { BarChart } from "layerchart";
import * as Card from "$lib/registry/ui/card/index.js";
import * as Chart from "$lib/registry/ui/chart/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="flex gap-2 leading-none font-medium">Trending up by 5.2% this month <!></div> <div class="leading-none text-muted-foreground">Showing total visitors for the last 6 months</div>`, 1);
var root_2 = $.from_html(`<!> <!> <!>`, 1);

export default function Chart_bar_example($$anchor, $$props) {
	$.push($$props, true);

	const barChartData = [
		{ month: "January", desktop: 186, mobile: 80 },
		{ month: "February", desktop: 305, mobile: 200 },
		{ month: "March", desktop: 237, mobile: 120 },
		{ month: "April", desktop: 73, mobile: 190 },
		{ month: "May", desktop: 209, mobile: 130 },
		{ month: "June", desktop: 214, mobile: 140 }
	];

	const barChartConfig = {
		desktop: { label: "Desktop", color: "var(--chart-1)" },
		mobile: { label: "Mobile", color: "var(--chart-2)" }
	};

	Example($$anchor, {
		title: 'Bar Chart',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => Card.Root, ($$anchor, Card_Root) => {
				Card_Root($$anchor, {
					class: 'w-full',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_2();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, () => Card.Header, ($$anchor, Card_Header) => {
							Card_Header($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root();
									var node_2 = $.first_child(fragment_3);

									$.component(node_2, () => Card.Title, ($$anchor, Card_Title) => {
										Card_Title($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text = $.text('Bar Chart - Multiple');

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

									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});
						});

						var node_4 = $.sibling(node_1, 2);

						$.component(node_4, () => Card.Content, ($$anchor, Card_Content) => {
							Card_Content($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_4 = $.comment();
									var node_5 = $.first_child(fragment_4);

									$.component(node_5, () => Chart.Container, ($$anchor, Chart_Container) => {
										Chart_Container($$anchor, {
											get config() {
												return barChartConfig;
											},

											children: ($$anchor, $$slotProps) => {
												{
													const tooltip = ($$anchor) => {
														var fragment_6 = $.comment();
														var node_6 = $.first_child(fragment_6);

														$.component(node_6, () => Chart.Tooltip, ($$anchor, Chart_Tooltip) => {
															Chart_Tooltip($$anchor, { indicator: 'dashed' });
														});

														$.append($$anchor, fragment_6);
													};

													let $0 = $.derived(() => scaleBand().padding(0.25));

													let $1 = $.derived(() => [
														{
															key: "desktop",
															label: "Desktop",
															color: barChartConfig.desktop.color
														},

														{
															key: "mobile",
															label: "Mobile",
															color: barChartConfig.mobile.color
														}
													]);

													let $2 = $.derived(() => scaleBand().paddingInner(0.2));

													BarChart($$anchor, {
														get data() {
															return barChartData;
														},

														get xScale() {
															return $.get($0);
														},
														x: 'month',
														axis: 'x',
														get series() {
															return $.get($1);
														},

														get x1Scale() {
															return $.get($2);
														},
														seriesLayout: 'group',
														rule: false,
														props: {
															bars: { stroke: "none", rounded: "all" },
															xAxis: { format: (d) => d.slice(0, 3), tickLength: 0 }
														},
														tooltip,
														$$slots: { tooltip: true }
													});
												}
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_4);
								},
								$$slots: { default: true }
							});
						});

						var node_7 = $.sibling(node_4, 2);

						$.component(node_7, () => Card.Footer, ($$anchor, Card_Footer) => {
							Card_Footer($$anchor, {
								class: 'flex-col items-start gap-2',
								children: ($$anchor, $$slotProps) => {
									var fragment_7 = root_1();
									var div = $.first_child(fragment_7);
									var node_8 = $.sibling($.child(div));

									IconPlaceholder(node_8, {
										lucide: 'TrendingUpIcon',
										tabler: 'IconTrendingUp',
										hugeicons: 'ChartUpIcon',
										phosphor: 'TrendUpIcon',
										remixicon: 'RiLineChartLine',
										class: 'size-4'
									});

									$.reset(div);
									$.next(2);
									$.append($$anchor, fragment_7);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}