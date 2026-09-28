import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { PieChart, Text } from "layerchart";
import * as Card from "$lib/registry/ui/card/index.js";
import * as Chart from "$lib/registry/ui/chart/index.js";
import { Badge } from "$lib/registry/ui/badge/index.js";
import { Progress } from "$lib/registry/ui/progress/index.js";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<div class="flex items-center text-xs"><span class="font-medium"> </span> <span class="ml-auto text-muted-foreground tabular-nums"> </span></div> <!>`, 1);

export default function Pie_chart_card($$anchor) {
	const pieChartData = [
		{
			browser: "Chrome",
			visitors: 275,
			color: "var(--color-Chrome)"
		},

		{
			browser: "Safari",
			visitors: 200,
			color: "var(--color-Safari)"
		},

		{
			browser: "Firefox",
			visitors: 287,
			color: "var(--color-Firefox)"
		},
		{ browser: "Edge", visitors: 173, color: "var(--color-Edge)" }
	];

	const pieChartConfig = {
		Visitors: { label: "Visitors" },
		Chrome: { label: "Chrome", color: "var(--chart-1)" },
		Safari: { label: "Safari", color: "var(--chart-2)" },
		Firefox: { label: "Firefox", color: "var(--chart-3)" },
		Edge: { label: "Edge", color: "var(--chart-4)" }
	};

	const totalVisitors = $.derived(() => pieChartData.reduce((sum, item) => sum + item.visitors, 0));
	const topBrowser = $.derived(() => pieChartData.reduce((max, item) => item.visitors > max.visitors ? item : max));
	const topBrowserShare = $.derived(() => Math.round($.get(topBrowser).visitors / $.get(totalVisitors) * 100));
	const topBrowserLabel = $.derived(() => pieChartConfig[$.get(topBrowser).browser]?.label ?? "Top");
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Card.Root, ($$anchor, Card_Root) => {
		Card_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Card.Header, ($$anchor, Card_Header) => {
					Card_Header($$anchor, {
						class: 'pb-0',
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root();
							var node_2 = $.first_child(fragment_2);

							$.component(node_2, () => Card.Title, ($$anchor, Card_Title) => {
								Card_Title($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('Browser Share');

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

										var text_1 = $.text('January - June 2026');

										$.append($$anchor, text_1);
									},
									$$slots: { default: true }
								});
							});

							var node_4 = $.sibling(node_3, 2);

							$.component(node_4, () => Card.Action, ($$anchor, Card_Action) => {
								Card_Action($$anchor, {
									children: ($$anchor, $$slotProps) => {
										Badge($$anchor, {
											variant: 'outline',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_2 = $.text();

												$.template_effect(() => $.set_text(text_2, $.get(topBrowserLabel)));
												$.append($$anchor, text_2);
											},
											$$slots: { default: true }
										});
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				var node_5 = $.sibling(node_1, 2);

				$.component(node_5, () => Card.Content, ($$anchor, Card_Content) => {
					Card_Content($$anchor, {
						class: 'pt-0',
						children: ($$anchor, $$slotProps) => {
							var fragment_5 = $.comment();
							var node_6 = $.first_child(fragment_5);

							$.component(node_6, () => Chart.Container, ($$anchor, Chart_Container) => {
								Chart_Container($$anchor, {
									get config() {
										return pieChartConfig;
									},
									class: 'mx-auto aspect-square max-h-[190px]',
									children: ($$anchor, $$slotProps) => {
										{
											const aboveMarks = ($$anchor) => {
												var fragment_7 = root_1();
												var node_7 = $.first_child(fragment_7);

												{
													let $0 = $.derived(() => String($.get(totalVisitors)));

													Text(node_7, {
														get value() {
															return $.get($0);
														},
														textAnchor: 'middle',
														verticalAnchor: 'middle',
														class: 'fill-foreground text-3xl! font-bold',
														dy: 3
													});
												}

												var node_8 = $.sibling(node_7, 2);

												Text(node_8, {
													value: 'Visitors',
													textAnchor: 'middle',
													verticalAnchor: 'middle',
													class: 'fill-muted-foreground! text-muted-foreground',
													dy: 22
												});

												$.append($$anchor, fragment_7);
											};

											const tooltip = ($$anchor) => {
												var fragment_8 = $.comment();
												var node_9 = $.first_child(fragment_8);

												$.component(node_9, () => Chart.Tooltip, ($$anchor, Chart_Tooltip) => {
													Chart_Tooltip($$anchor, { hideLabel: true });
												});

												$.append($$anchor, fragment_8);
											};

											PieChart($$anchor, {
												get data() {
													return pieChartData;
												},
												key: 'browser',
												value: 'visitors',
												c: 'color',
												innerRadius: 0.8,
												padding: 28,
												props: { pie: { motion: "tween" } },
												aboveMarks,
												tooltip,
												$$slots: { aboveMarks: true, tooltip: true }
											});
										}
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_5);
						},
						$$slots: { default: true }
					});
				});

				var node_10 = $.sibling(node_5, 2);

				$.component(node_10, () => Card.Footer, ($$anchor, Card_Footer) => {
					Card_Footer($$anchor, {
						class: 'flex-col items-stretch gap-2',
						children: ($$anchor, $$slotProps) => {
							var fragment_9 = root_2();
							var div = $.first_child(fragment_9);
							var span = $.child(div);
							var text_3 = $.only_child(span, true);
							var span_1 = $.sibling(span, 2);
							var text_4 = $.only_child(span_1);

							$.reset(div);

							var node_11 = $.sibling(div, 2);

							Progress(node_11, {
								get value() {
									return $.get(topBrowserShare);
								},
								class: '**:data-[slot=progress-indicator]:bg-chart-3'
							});

							$.template_effect(() => {
								$.set_text(text_3, $.get(topBrowserLabel));
								$.set_text(text_4, `${$.get(topBrowserShare) ?? ''}%`);
							});

							$.append($$anchor, fragment_9);
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
}