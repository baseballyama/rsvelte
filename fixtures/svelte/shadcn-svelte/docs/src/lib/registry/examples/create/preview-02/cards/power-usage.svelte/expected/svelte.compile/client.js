import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { scaleBand } from "d3-scale";
import { BarChart } from "layerchart";
import * as Card from "$lib/registry/ui/card/index.js";
import * as Chart from "$lib/registry/ui/chart/index.js";
import { Progress } from "$lib/registry/ui/progress/index.js";
import { Separator } from "$lib/registry/ui/separator/index.js";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <div class="grid grid-cols-2 gap-4"><div class="flex flex-col gap-0.5"><span class="text-sm text-muted-foreground">Currently Using</span> <span class="text-lg font-semibold tabular-nums">3.4 kW</span></div> <div class="flex flex-col gap-0.5"><span class="text-sm text-muted-foreground">Solar Gen</span> <span class="text-lg font-semibold text-chart-1 tabular-nums">+1.2 kW</span></div></div>`, 1);
var root_2 = $.from_html(`<span class="text-sm text-muted-foreground">Battery Level</span> <div class="flex w-full items-center gap-2"><!> <span class="text-sm font-medium tabular-nums">85%</span></div>`, 1);
var root_3 = $.from_html(`<!> <!> <!>`, 1);

export default function Power_usage($$anchor, $$props) {
	$.push($$props, true);

	const chartData = [
		{ hour: "6a", usage: 1.2 },
		{ hour: "8a", usage: 2.8 },
		{ hour: "10a", usage: 3.1 },
		{ hour: "12p", usage: 2.4 },
		{ hour: "2p", usage: 3.4 },
		{ hour: "4p", usage: 2.9 },
		{ hour: "6p", usage: 3.8 },
		{ hour: "8p", usage: 3.2 }
	];

	const chartConfig = { usage: { label: "Usage (kW)", color: "var(--chart-2)" } };
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Card.Root, ($$anchor, Card_Root) => {
		Card_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_3();
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

										var text = $.text('Power Usage');

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

										var text_1 = $.text('Whole Home');

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
						class: 'flex flex-col gap-4',
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root_1();
							var node_5 = $.first_child(fragment_3);

							$.component(node_5, () => Chart.Container, ($$anchor, Chart_Container) => {
								Chart_Container($$anchor, {
									get config() {
										return chartConfig;
									},
									class: 'h-[140px] w-full',
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

											let $0 = $.derived(() => scaleBand().padding(0.2));

											let $1 = $.derived(() => [
												{
													key: "usage",
													label: chartConfig.usage.label,
													color: chartConfig.usage.color
												}
											]);

											BarChart($$anchor, {
												get data() {
													return chartData;
												},
												x: 'hour',
												get xScale() {
													return $.get($0);
												},
												axis: 'x',
												rule: false,
												get series() {
													return $.get($1);
												},

												props: {
													bars: { rounded: "top" },
													xAxis: { tickLength: 0, class: "text-xs" }
												},
												tooltip,
												$$slots: { tooltip: true }
											});
										}
									},
									$$slots: { default: true }
								});
							});

							var node_7 = $.sibling(node_5, 2);

							Separator(node_7, {});
							$.next(2);
							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});
				});

				var node_8 = $.sibling(node_4, 2);

				$.component(node_8, () => Card.Footer, ($$anchor, Card_Footer) => {
					Card_Footer($$anchor, {
						class: 'flex-col items-start gap-1',
						children: ($$anchor, $$slotProps) => {
							var fragment_6 = root_2();
							var div = $.sibling($.first_child(fragment_6), 2);
							var node_9 = $.child(div);

							Progress(node_9, { value: 85, class: 'flex-1' });
							$.next(2);
							$.reset(div);
							$.append($$anchor, fragment_6);
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