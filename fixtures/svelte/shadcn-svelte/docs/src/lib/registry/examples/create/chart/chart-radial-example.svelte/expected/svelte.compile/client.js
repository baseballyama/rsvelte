import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ArcChart, Text } from "layerchart";
import * as Card from "$lib/registry/ui/card/index.js";
import * as Chart from "$lib/registry/ui/chart/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_svg(`<circle cx="0" cy="0" r="80" class="fill-background"></circle>`);
var root_2 = $.from_html(`<div class="flex items-center gap-2 leading-none font-medium">Trending up by 5.2% this month <!></div> <div class="leading-none text-muted-foreground">Showing total visitors for the last 6 months</div>`, 1);
var root_3 = $.from_html(`<!> <!> <!>`, 1);

export default function Chart_radial_example($$anchor) {
	const radialChartData = [
		{
			browser: "safari",
			visitors: 1260,
			fill: "var(--color-safari)"
		}
	];

	const radialChartConfig = {
		visitors: { label: "Visitors" },
		safari: { label: "Safari", color: "var(--chart-2)" }
	};

	Example($$anchor, {
		title: 'Radial Chart',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => Card.Root, ($$anchor, Card_Root) => {
				Card_Root($$anchor, {
					class: 'w-full',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_3();
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
								class: 'flex-1 pb-0',
								children: ($$anchor, $$slotProps) => {
									var fragment_4 = $.comment();
									var node_5 = $.first_child(fragment_4);

									$.component(node_5, () => Chart.Container, ($$anchor, Chart_Container) => {
										Chart_Container($$anchor, {
											get config() {
												return radialChartConfig;
											},
											class: 'mx-auto aspect-square max-h-[210px]',
											children: ($$anchor, $$slotProps) => {
												{
													const belowMarks = ($$anchor) => {
														var circle = root_1();

														$.append($$anchor, circle);
													};

													const aboveMarks = ($$anchor) => {
														var fragment_6 = root();
														var node_6 = $.first_child(fragment_6);

														{
															let $0 = $.derived(() => String(radialChartData[0].visitors));

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

														$.append($$anchor, fragment_6);
													};

													let $0 = $.derived(() => radialChartData[0].visitors * 4);
													let $1 = $.derived(() => radialChartData.map((d) => ({ key: d.browser, color: d.fill, data: [d] })));

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

									$.append($$anchor, fragment_4);
								},
								$$slots: { default: true }
							});
						});

						var node_8 = $.sibling(node_4, 2);

						$.component(node_8, () => Card.Footer, ($$anchor, Card_Footer) => {
							Card_Footer($$anchor, {
								class: 'flex-col gap-2',
								children: ($$anchor, $$slotProps) => {
									var fragment_7 = root_2();
									var div = $.first_child(fragment_7);
									var node_9 = $.sibling($.child(div));

									IconPlaceholder(node_9, {
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
}