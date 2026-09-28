import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TrendingUpIcon from "@lucide/svelte/icons/trending-up";
import { ArcChart, Text } from "layerchart";
import * as Card from "$lib/registry/ui/card/index.js";
import * as Chart from "$lib/registry/ui/chart/index.js";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_svg(`<circle cx="0" cy="0" r="80" class="fill-background"></circle>`);
var root_2 = $.from_html(`<div class="flex items-center gap-2 leading-none font-medium">Trending up by 5.2% this month <!></div> <div class="flex items-center gap-2 leading-none text-muted-foreground">January - June 2024</div>`, 1);
var root_3 = $.from_html(`<!> <!> <!>`, 1);

export default function Chart_radial_shape($$anchor) {
	const chartData = [
		{
			browser: "safari",
			visitors: 1260,
			color: "var(--color-safari)"
		}
	];

	const chartConfig = {
		visitors: { label: "Visitors" },
		safari: { label: "Safari", color: "var(--chart-2)" }
	};

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Card.Root, ($$anchor, Card_Root) => {
		Card_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_3();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Card.Header, ($$anchor, Card_Header) => {
					Card_Header($$anchor, {
						class: 'items-center',
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root();
							var node_2 = $.first_child(fragment_2);

							$.component(node_2, () => Card.Title, ($$anchor, Card_Title) => {
								Card_Title($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('Radial Chart - Shape');

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
						class: 'flex-1',
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = $.comment();
							var node_5 = $.first_child(fragment_3);

							$.component(node_5, () => Chart.Container, ($$anchor, Chart_Container) => {
								Chart_Container($$anchor, {
									get config() {
										return chartConfig;
									},
									class: 'mx-auto aspect-square max-h-[250px]',
									children: ($$anchor, $$slotProps) => {
										{
											const belowMarks = ($$anchor) => {
												var circle = root_1();

												$.append($$anchor, circle);
											};

											const aboveMarks = ($$anchor) => {
												var fragment_5 = root();
												var node_6 = $.first_child(fragment_5);

												{
													let $0 = $.derived(() => String(chartData[0].visitors));

													Text(node_6, {
														get value() {
															return $.get($0);
														},
														textAnchor: 'middle',
														verticalAnchor: 'middle',
														class: 'fill-foreground text-4xl! font-bold',
														dy: 3
													});
												}

												var node_7 = $.sibling(node_6, 2);

												Text(node_7, {
													value: 'Visitors',
													textAnchor: 'middle',
													verticalAnchor: 'middle',
													class: 'fill-muted-foreground!',
													dy: 22
												});

												$.append($$anchor, fragment_5);
											};

											let $0 = $.derived(() => chartData[0].visitors * 4);
											let $1 = $.derived(() => chartData.map((d) => ({ key: d.browser, color: d.color, data: [d] })));

											ArcChart($$anchor, {
												label: 'browser',
												value: 'visitors',
												outerRadius: 88,
												innerRadius: 66,
												trackOuterRadius: 83,
												trackInnerRadius: 72,
												padding: 40,
												range: [90, -270],
												get maxValue() {
													return $.get($0);
												},

												get series() {
													return $.get($1);
												},

												props: {
													arc: { track: { fill: "var(--muted)" }, motion: "tween" },
													tooltip: { context: { hideDelay: 350 } }
												},
												tooltipContext: false,
												belowMarks,
												aboveMarks,
												$$slots: { belowMarks: true, aboveMarks: true }
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

				var node_8 = $.sibling(node_4, 2);

				$.component(node_8, () => Card.Footer, ($$anchor, Card_Footer) => {
					Card_Footer($$anchor, {
						class: 'flex-col gap-2 text-sm',
						children: ($$anchor, $$slotProps) => {
							var fragment_6 = root_2();
							var div = $.first_child(fragment_6);
							var node_9 = $.sibling($.child(div));

							TrendingUpIcon(node_9, { class: 'size-4' });
							$.reset(div);
							$.next(2);
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
}