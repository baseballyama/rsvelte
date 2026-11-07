import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { curveLinear } from "d3-shape";
import { AreaChart } from "layerchart";
import * as Card from "$lib/registry/ui/card/index.js";
import * as Chart from "$lib/registry/ui/chart/index.js";
import { Badge } from "$lib/registry/ui/badge/index.js";
import { Button } from "$lib/registry/ui/button/index.js";

var root = $.from_html(`418.2K Visitors <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function Analytics_card($$anchor) {
	const chartData = [
		{ month: "Jan", visitors: 186 },
		{ month: "Feb", visitors: 305 },
		{ month: "Mar", visitors: 237 },
		{ month: "Apr", visitors: 73 },
		{ month: "May", visitors: 209 },
		{ month: "Jun", visitors: 214 }
	];

	const chartConfig = { visitors: { label: "Visitors", color: "var(--chart-1)" } };
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Card.Root, ($$anchor, Card_Root) => {
		Card_Root($$anchor, {
			class: 'data-[size=sm]:pb-0',
			size: 'sm',
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_2();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Card.Header, ($$anchor, Card_Header) => {
					Card_Header($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root_1();
							var node_2 = $.first_child(fragment_2);

							$.component(node_2, () => Card.Title, ($$anchor, Card_Title) => {
								Card_Title($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('Analytics');

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

										var fragment_3 = root();
										var node_4 = $.sibling($.first_child(fragment_3));

										Badge(node_4, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_1 = $.text('+10%');

												$.append($$anchor, text_1);
											},
											$$slots: { default: true }
										});

										$.append($$anchor, fragment_3);
									},
									$$slots: { default: true }
								});
							});

							var node_5 = $.sibling(node_3, 2);

							$.component(node_5, () => Card.Action, ($$anchor, Card_Action) => {
								Card_Action($$anchor, {
									children: ($$anchor, $$slotProps) => {
										Button($$anchor, {
											variant: 'outline',
											size: 'sm',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_2 = $.text('View Analytics');

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

				var node_6 = $.sibling(node_1, 2);

				$.component(node_6, () => Chart.Container, ($$anchor, Chart_Container) => {
					Chart_Container($$anchor, {
						get config() {
							return chartConfig;
						},
						class: 'aspect-[1/0.35]',
						children: ($$anchor, $$slotProps) => {
							{
								const tooltip = ($$anchor) => {
									var fragment_6 = $.comment();
									var node_7 = $.first_child(fragment_6);

									$.component(node_7, () => Chart.Tooltip, ($$anchor, Chart_Tooltip) => {
										Chart_Tooltip($$anchor, { indicator: 'line', hideLabel: true });
									});

									$.append($$anchor, fragment_6);
								};

								let $0 = $.derived(() => [
									{
										key: "visitors",
										label: "Visitors",
										color: chartConfig.visitors.color
									}
								]);

								let $1 = $.derived(() => ({
									area: {
										curve: curveLinear,
										fillOpacity: 0.4,
										line: { class: "stroke-1" }
									},
									xAxis: { format: () => "" },
									yAxis: { format: () => "" }
								}));

								AreaChart($$anchor, {
									get data() {
										return chartData;
									},
									x: 'month',
									get series() {
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

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
}