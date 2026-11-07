import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TrendingUpIcon from "@lucide/svelte/icons/trending-up";
import { Arc, ArcChart, Text } from "layerchart";
import * as Card from "$lib/registry/ui/card/index.js";
import * as Chart from "$lib/registry/ui/chart/index.js";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="flex items-center gap-2 leading-none font-medium">Trending up by 5.2% this month <!></div> <div class="flex items-center gap-2 leading-none text-muted-foreground">January - June 2024</div>`, 1);
var root_2 = $.from_html(`<!> <!> <!>`, 1);

export default function Chart_radial_label($$anchor) {
	const chartData = [
		{ browser: "other", visitors: 90, color: "var(--color-other)" },
		{ browser: "edge", visitors: 173, color: "var(--color-edge)" },
		{
			browser: "firefox",
			visitors: 187,
			color: "var(--color-firefox)"
		},

		{
			browser: "safari",
			visitors: 200,
			color: "var(--color-safari)"
		},

		{
			browser: "chrome",
			visitors: 275,
			color: "var(--color-chrome)"
		}
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
						class: 'items-center',
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root();
							var node_2 = $.first_child(fragment_2);

							$.component(node_2, () => Card.Title, ($$anchor, Card_Title) => {
								Card_Title($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('Radial Chart - Label');

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
											const tooltip = ($$anchor) => {
												var fragment_5 = $.comment();
												var node_6 = $.first_child(fragment_5);

												$.component(node_6, () => Chart.Tooltip, ($$anchor, Chart_Tooltip) => {
													Chart_Tooltip($$anchor, { hideLabel: true, nameKey: 'browser' });
												});

												$.append($$anchor, fragment_5);
											};

											const arc = ($$anchor, $$arg0) => {
												let props = () => ($$arg0?.()).props;
												let seriesIndex = () => ($$arg0?.()).seriesIndex;
												let context = () => ($$arg0?.()).context;

												{
													const children = ($$anchor, $$arg0) => {
														let getTrackTextProps = () => ($$arg0?.()).getTrackTextProps;

														{
															let $0 = $.derived(() => getTrackTextProps()("middle", { startOffset: "1%" }));

															Text($$anchor, $.spread_props(() => $.get($0), {
																class: 'pointer-events-none capitalize select-none',
																get value() {
																	return context().series.visibleSeries[seriesIndex()].label;
																},
																fill: 'white'
															}));
														}
													};

													Arc($$anchor, $.spread_props(props, { children, $$slots: { default: true } }));
												}
											};

											let $0 = $.derived(() => Math.max(...chartData.map((d) => d.visitors)) + 0);
											let $1 = $.derived(() => chartData.map((d) => ({ key: d.browser, color: d.color, data: [d], label: d.browser })));

											ArcChart($$anchor, {
												label: 'browser',
												value: 'visitors',
												outerRadius: -17,
												innerRadius: -12.5,
												padding: 20,
												range: [180, -180],
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
												tooltip,
												arc,
												$$slots: { tooltip: true, arc: true }
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
						class: 'flex-col gap-2 text-sm',
						children: ($$anchor, $$slotProps) => {
							var fragment_8 = root_1();
							var div = $.first_child(fragment_8);
							var node_8 = $.sibling($.child(div));

							TrendingUpIcon(node_8, { class: 'size-4' });
							$.reset(div);
							$.next(2);
							$.append($$anchor, fragment_8);
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