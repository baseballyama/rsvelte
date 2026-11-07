import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { scaleBand } from "d3-scale";
import { BarChart } from "layerchart";
import * as Card from "$lib/registry/ui/card/index.js";
import * as Chart from "$lib/registry/ui/chart/index.js";
import { Badge } from "$lib/registry/ui/badge/index.js";
import { Button } from "$lib/registry/ui/button/index.js";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="text-center"><div class="text-sm font-medium tabular-nums"> </div> <div class="text-xs text-muted-foreground"> </div></div>`);
var root_2 = $.from_html(`<!> <div class="grid grid-cols-4 gap-2"></div>`, 1);
var root_3 = $.from_html(`<!> <!> <!>`, 1);

export default function Sleep_report($$anchor, $$props) {
	$.push($$props, true);

	const sleepChartData = [
		{ hour: "10pm", deep: 0, light: 30, rem: 0 },
		{ hour: "11pm", deep: 20, light: 10, rem: 0 },
		{ hour: "12am", deep: 40, light: 0, rem: 10 },
		{ hour: "1am", deep: 30, light: 5, rem: 15 },
		{ hour: "2am", deep: 10, light: 20, rem: 30 },
		{ hour: "3am", deep: 25, light: 10, rem: 20 },
		{ hour: "4am", deep: 15, light: 25, rem: 10 },
		{ hour: "5am", deep: 5, light: 35, rem: 15 },
		{ hour: "6am", deep: 0, light: 20, rem: 25 }
	];

	const sleepChartConfig = {
		deep: { label: "Deep", color: "var(--chart-1)" },
		light: { label: "Light", color: "var(--chart-2)" },
		rem: { label: "REM", color: "var(--chart-3)" }
	};

	const stats = [
		{ label: "Deep", value: "2h 10m" },
		{ label: "Light", value: "3h 48m" },
		{ label: "REM", value: "1h 26m" },
		{ label: "Score", value: "84" }
	];

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

										var text = $.text('Sleep Report');

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

										var text_1 = $.text('Last night · 7h 24m');

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
						class: 'flex flex-col gap-3',
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root_2();
							var node_5 = $.first_child(fragment_3);

							$.component(node_5, () => Chart.Container, ($$anchor, Chart_Container) => {
								Chart_Container($$anchor, {
									get config() {
										return sleepChartConfig;
									},
									class: 'h-32 w-full',
									children: ($$anchor, $$slotProps) => {
										{
											let $0 = $.derived(() => scaleBand().padding(0.4));

											let $1 = $.derived(() => [
												{
													key: "deep",
													label: "Deep",
													color: sleepChartConfig.deep.color,
													props: { rounded: "none" }
												},

												{
													key: "light",
													label: "Light",
													color: sleepChartConfig.light.color,
													props: { rounded: "none" }
												},

												{
													key: "rem",
													label: "REM",
													color: sleepChartConfig.rem.color,
													props: { rounded: "top" }
												}
											]);

											BarChart($$anchor, {
												get data() {
													return sleepChartData;
												},

												get xScale() {
													return $.get($0);
												},
												x: 'hour',
												rule: false,
												get series() {
													return $.get($1);
												},
												seriesLayout: 'stack',
												props: { bars: { stroke: "none" } },
												axis: false,
												tooltipContext: false
											});
										}
									},
									$$slots: { default: true }
								});
							});

							var div = $.sibling(node_5, 2);

							$.each(div, 21, () => stats, ({ label, value }) => label, ($$anchor, $$item) => {
								let label = () => $.get($$item).label;
								let value = () => $.get($$item).value;
								var div_1 = root_1();
								var div_2 = $.child(div_1);
								var text_2 = $.only_child(div_2, true);
								var div_3 = $.sibling(div_2, 2);
								var text_3 = $.only_child(div_3, true);

								$.reset(div_1);

								$.template_effect(() => {
									$.set_text(text_2, value());
									$.set_text(text_3, label());
								});

								$.append($$anchor, div_1);
							});

							$.reset(div);
							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});
				});

				var node_6 = $.sibling(node_4, 2);

				$.component(node_6, () => Card.Footer, ($$anchor, Card_Footer) => {
					Card_Footer($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_5 = root();
							var node_7 = $.first_child(fragment_5);

							Badge(node_7, {
								variant: 'outline',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_4 = $.text('Good');

									$.append($$anchor, text_4);
								},
								$$slots: { default: true }
							});

							var node_8 = $.sibling(node_7, 2);

							Button(node_8, {
								variant: 'outline',
								size: 'sm',
								class: 'ml-auto',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_5 = $.text('Details');

									$.append($$anchor, text_5);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_5);
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