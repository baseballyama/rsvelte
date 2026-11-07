import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TrendingUpIcon from "@lucide/svelte/icons/trending-up";
import { scaleBand } from "d3-scale";
import { curveNatural } from "d3-shape";
import { LineChart } from "layerchart";
import * as Card from "$lib/registry/ui/card/index.js";
import * as Chart from "$lib/registry/ui/chart/index.js";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="flex w-full items-start gap-2 text-sm"><div class="grid gap-2"><div class="flex items-center gap-2 leading-none font-medium">Trending up by 5.2% this month <!></div> <div class="flex items-center gap-2 leading-none text-muted-foreground">January - June 2024</div></div></div>`);
var root_2 = $.from_html(`<!> <!> <!>`, 1);

export default function Chart_line_label_custom($$anchor, $$props) {
	$.push($$props, true);

	const chartData = [
		{
			browser: "chrome",
			visitors: 275,
			color: "var(--color-chrome)"
		},

		{
			browser: "safari",
			visitors: 200,
			color: "var(--color-safari)"
		},

		{
			browser: "firefox",
			visitors: 187,
			color: "var(--color-firefox)"
		},
		{ browser: "edge", visitors: 173, color: "var(--color-edge)" },
		{ browser: "other", visitors: 90, color: "var(--color-other)" }
	];

	const chartConfig = {
		visitors: { label: "Visitors", color: "var(--chart-2)" },
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

										var text = $.text('Line Chart - Custom Label');

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

											let $0 = $.derived(scaleBand);

											let $1 = $.derived(() => ({
												spline: {
													curve: curveNatural,
													motion: "tween",
													strokeWidth: 2,
													stroke: "var(--color-visitors)"
												}
											}));

											LineChart($$anchor, {
												get data() {
													return chartData;
												},
												y: 'visitors',
												yPadding: [0, 25],
												x: 'browser',
												axis: false,
												get xScale() {
													return $.get($0);
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

				var node_7 = $.sibling(node_4, 2);

				$.component(node_7, () => Card.Footer, ($$anchor, Card_Footer) => {
					Card_Footer($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var div = root_1();
							var div_1 = $.child(div);
							var div_2 = $.child(div_1);
							var node_8 = $.sibling($.child(div_2));

							TrendingUpIcon(node_8, { class: 'size-4' });
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