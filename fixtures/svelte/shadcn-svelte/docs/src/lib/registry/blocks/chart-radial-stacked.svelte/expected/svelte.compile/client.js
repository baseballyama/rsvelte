import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TrendingUpIcon from "@lucide/svelte/icons/trending-up";
import { PieChart, Text } from "layerchart";
import * as Card from "$lib/registry/ui/card/index.js";
import * as Chart from "$lib/registry/ui/chart/index.js";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="flex items-center gap-2 leading-none font-medium">Trending up by 5.2% this month <!></div> <div class="leading-none text-muted-foreground">Showing total visitors for the last 6 months</div>`, 1);
var root_2 = $.from_html(`<!> <!> <!>`, 1);

export default function Chart_radial_stacked($$anchor) {
	const chartData = [{ month: "january", desktop: 1260, mobile: 570 }];

	const chartConfig = {
		desktop: { label: "Desktop", color: "var(--chart-1)" },
		mobile: { label: "Mobile", color: "var(--chart-2)" }
	};

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Card.Root, ($$anchor, Card_Root) => {
		Card_Root($$anchor, {
			class: 'flex flex-col',
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

										var text = $.text('Radial Chart - Stacked');

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
											const aboveMarks = ($$anchor) => {
												var fragment_5 = root();
												var node_6 = $.first_child(fragment_5);

												{
													let $0 = $.derived(() => String(chartData[0].desktop + chartData[0].mobile));

													Text(node_6, {
														get value() {
															return $.get($0);
														},
														textAnchor: 'middle',
														verticalAnchor: 'middle',
														class: 'fill-foreground text-2xl! font-bold',
														dy: -24
													});
												}

												var node_7 = $.sibling(node_6, 2);

												Text(node_7, {
													value: 'Visitors',
													textAnchor: 'middle',
													verticalAnchor: 'middle',
													class: 'fill-muted-foreground! text-muted-foreground',
													dy: -4
												});

												$.append($$anchor, fragment_5);
											};

											const tooltip = ($$anchor) => {
												var fragment_6 = $.comment();
												var node_8 = $.first_child(fragment_6);

												$.component(node_8, () => Chart.Tooltip, ($$anchor, Chart_Tooltip) => {
													Chart_Tooltip($$anchor, { hideLabel: true });
												});

												$.append($$anchor, fragment_6);
											};

											let $0 = $.derived(() => [
												{
													platform: "mobile",
													visitors: 570,
													color: chartConfig.mobile.color
												},

												{
													platform: "desktop",
													visitors: 1260,
													color: chartConfig.desktop.color
												}
											]);

											PieChart($$anchor, {
												get data() {
													return $.get($0);
												},
												key: 'platform',
												value: 'visitors',
												c: 'color',
												innerRadius: 76,
												padding: 29,
												range: [-90, 90],
												props: { pie: { sort: null } },
												cornerRadius: 4,
												aboveMarks,
												tooltip,
												$$slots: { aboveMarks: true, tooltip: true }
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
						class: 'flex-col gap-2 text-sm',
						children: ($$anchor, $$slotProps) => {
							var fragment_7 = root_1();
							var div = $.first_child(fragment_7);
							var node_10 = $.sibling($.child(div));

							TrendingUpIcon(node_10, { class: 'size-4' });
							$.reset(div);
							$.next(2);
							$.append($$anchor, fragment_7);
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