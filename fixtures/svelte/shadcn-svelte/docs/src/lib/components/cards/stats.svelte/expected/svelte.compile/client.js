import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { curveNatural } from "d3-shape";
import { AreaChart, LineChart } from "layerchart";
import * as Card from "$lib/registry/ui/card/index.js";
import * as Chart from "$lib/registry/ui/chart/index.js";
import { Button } from "$lib/registry/ui/button/index.js";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_3 = $.from_html(`<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2"><!> <!></div>`);

export default function Stats($$anchor) {
	const data = [
		{ revenue: 10400, subscription: 40 },
		{ revenue: 14405, subscription: 90 },
		{ revenue: 9400, subscription: 200 },
		{ revenue: 8200, subscription: 278 },
		{ revenue: 7000, subscription: 89 },
		{ revenue: 9600, subscription: 239 },
		{ revenue: 11244, subscription: 78 },
		{ revenue: 26475, subscription: 89 }
	];

	const chartConfig = {
		revenue: { label: "Revenue", color: "var(--primary)" },
		subscription: { label: "Subscriptions", color: "var(--primary)" }
	};

	var div = root_3();
	var node = $.child(div);

	$.component(node, () => Card.Root, ($$anchor, Card_Root) => {
		Card_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment = root_1();
				var node_1 = $.first_child(fragment);

				$.component(node_1, () => Card.Header, ($$anchor, Card_Header) => {
					Card_Header($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_1 = root();
							var node_2 = $.first_child(fragment_1);

							$.component(node_2, () => Card.Description, ($$anchor, Card_Description) => {
								Card_Description($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('Total Revenue');

										$.append($$anchor, text);
									},
									$$slots: { default: true }
								});
							});

							var node_3 = $.sibling(node_2, 2);

							$.component(node_3, () => Card.Title, ($$anchor, Card_Title) => {
								Card_Title($$anchor, {
									class: 'text-3xl',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_1 = $.text('$15,231.89');

										$.append($$anchor, text_1);
									},
									$$slots: { default: true }
								});
							});

							var node_4 = $.sibling(node_3, 2);

							$.component(node_4, () => Card.Description, ($$anchor, Card_Description_1) => {
								Card_Description_1($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_2 = $.text('+20.1% from last month');

										$.append($$anchor, text_2);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_1);
						},
						$$slots: { default: true }
					});
				});

				var node_5 = $.sibling(node_1, 2);

				$.component(node_5, () => Card.Content, ($$anchor, Card_Content) => {
					Card_Content($$anchor, {
						class: 'pb-0',
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = $.comment();
							var node_6 = $.first_child(fragment_2);

							$.component(node_6, () => Chart.Container, ($$anchor, Chart_Container) => {
								Chart_Container($$anchor, {
									get config() {
										return chartConfig;
									},
									class: 'h-[80px] w-full',
									children: ($$anchor, $$slotProps) => {
										{
											let $0 = $.derived(() => data.map((d, i) => ({ ...d, index: i })));

											let $1 = $.derived(() => ({
												spline: {
													curve: curveNatural,
													strokeWidth: 2,
													stroke: "var(--color-revenue)"
												},
												points: { r: 3, stroke: "var(--color-revenue)", strokeWidth: 2 }
											}));

											LineChart($$anchor, {
												axis: false,
												get data() {
													return $.get($0);
												},
												x: 'index',
												y: 'revenue',
												points: true,
												grid: false,
												tooltipContext: false,
												highlight: false,
												get props() {
													return $.get($1);
												}
											});
										}
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	});

	var node_7 = $.sibling(node, 2);

	$.component(node_7, () => Card.Root, ($$anchor, Card_Root_1) => {
		Card_Root_1($$anchor, {
			class: 'pb-0 lg:hidden xl:flex',
			children: ($$anchor, $$slotProps) => {
				var fragment_4 = root_1();
				var node_8 = $.first_child(fragment_4);

				$.component(node_8, () => Card.Header, ($$anchor, Card_Header_1) => {
					Card_Header_1($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_5 = root_2();
							var node_9 = $.first_child(fragment_5);

							$.component(node_9, () => Card.Description, ($$anchor, Card_Description_2) => {
								Card_Description_2($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_3 = $.text('Subscriptions');

										$.append($$anchor, text_3);
									},
									$$slots: { default: true }
								});
							});

							var node_10 = $.sibling(node_9, 2);

							$.component(node_10, () => Card.Title, ($$anchor, Card_Title_1) => {
								Card_Title_1($$anchor, {
									class: 'text-3xl',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_4 = $.text('+2,350');

										$.append($$anchor, text_4);
									},
									$$slots: { default: true }
								});
							});

							var node_11 = $.sibling(node_10, 2);

							$.component(node_11, () => Card.Description, ($$anchor, Card_Description_3) => {
								Card_Description_3($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_5 = $.text('+180.1% from last month');

										$.append($$anchor, text_5);
									},
									$$slots: { default: true }
								});
							});

							var node_12 = $.sibling(node_11, 2);

							$.component(node_12, () => Card.Action, ($$anchor, Card_Action) => {
								Card_Action($$anchor, {
									children: ($$anchor, $$slotProps) => {
										Button($$anchor, {
											variant: 'ghost',
											size: 'sm',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_6 = $.text('View More');

												$.append($$anchor, text_6);
											},
											$$slots: { default: true }
										});
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_5);
						},
						$$slots: { default: true }
					});
				});

				var node_13 = $.sibling(node_8, 2);

				$.component(node_13, () => Card.Content, ($$anchor, Card_Content_1) => {
					Card_Content_1($$anchor, {
						class: 'mt-auto max-h-[124px] flex-1 overflow-hidden p-0',
						children: ($$anchor, $$slotProps) => {
							var fragment_7 = $.comment();
							var node_14 = $.first_child(fragment_7);

							$.component(node_14, () => Chart.Container, ($$anchor, Chart_Container_1) => {
								Chart_Container_1($$anchor, {
									get config() {
										return chartConfig;
									},
									class: '-mb-4 h-full w-full overflow-hidden',
									children: ($$anchor, $$slotProps) => {
										{
											let $0 = $.derived(() => data.map((d, i) => ({ ...d, index: i })));

											let $1 = $.derived(() => ({
												area: {
													curve: curveNatural,
													fill: "var(--color-subscription)",
													fillOpacity: 0.05
												},
												line: { stroke: "var(--color-subscription)", strokeWidth: 2 }
											}));

											AreaChart($$anchor, {
												get data() {
													return $.get($0);
												},
												x: 'index',
												y: 'subscription',
												axis: false,
												grid: false,
												tooltipContext: false,
												yPadding: [0, 8],
												get props() {
													return $.get($1);
												}
											});
										}
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_7);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_4);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div);
	$.append($$anchor, div);
}