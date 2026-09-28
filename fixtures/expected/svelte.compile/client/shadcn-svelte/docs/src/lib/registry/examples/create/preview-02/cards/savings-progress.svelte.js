import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { PieChart, Text } from "layerchart";
import * as Card from "$lib/registry/ui/card/index.js";
import * as Chart from "$lib/registry/ui/chart/index.js";
import { Separator } from "$lib/registry/ui/separator/index.js";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="flex w-full items-center justify-between py-3"><span class="text-sm text-muted-foreground">Projected Finish</span> <span class="text-sm font-semibold">October 2024</span></div> <!> <div class="flex w-full items-center justify-between py-3"><span class="text-sm text-muted-foreground">Monthly Average</span> <span class="text-sm font-semibold tabular-nums">$1,250</span></div> <!> <div class="flex w-full items-center justify-between py-3"><span class="text-sm text-muted-foreground">Top Contributor</span> <span class="text-sm font-semibold">Auto-Transfer</span></div>`, 1);

export default function Savings_progress($$anchor) {
	const chartData = [
		{ name: "saved", value: 24000, color: "var(--color-saved)" },
		{
			name: "remaining",
			value: 6000,
			color: "var(--color-remaining)"
		}
	];

	const chartConfig = {
		saved: { label: "Saved", color: "var(--chart-2)" },
		remaining: { label: "Remaining", color: "var(--chart-1)" }
	};

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Card.Root, ($$anchor, Card_Root) => {
		Card_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Card.Content, ($$anchor, Card_Content) => {
					Card_Content($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = $.comment();
							var node_2 = $.first_child(fragment_2);

							$.component(node_2, () => Chart.Container, ($$anchor, Chart_Container) => {
								Chart_Container($$anchor, {
									get config() {
										return chartConfig;
									},
									class: 'mx-auto aspect-square max-h-[220px]',
									children: ($$anchor, $$slotProps) => {
										{
											const aboveMarks = ($$anchor) => {
												var fragment_4 = root();
												var node_3 = $.first_child(fragment_4);

												Text(node_3, {
													value: '$24,000',
													textAnchor: 'middle',
													verticalAnchor: 'middle',
													class: 'fill-foreground text-2xl! font-bold',
													dy: -8
												});

												var node_4 = $.sibling(node_3, 2);

												Text(node_4, {
													value: '80% of $30,000',
													textAnchor: 'middle',
													verticalAnchor: 'middle',
													class: 'fill-muted-foreground! text-muted-foreground',
													dy: 14
												});

												$.append($$anchor, fragment_4);
											};

											const tooltip = ($$anchor) => {
												var fragment_5 = $.comment();
												var node_5 = $.first_child(fragment_5);

												$.component(node_5, () => Chart.Tooltip, ($$anchor, Chart_Tooltip) => {
													Chart_Tooltip($$anchor, { hideLabel: true });
												});

												$.append($$anchor, fragment_5);
											};

											PieChart($$anchor, {
												get data() {
													return chartData;
												},
												key: 'name',
												value: 'value',
												c: 'color',
												innerRadius: 0.8,
												padding: 28,
												aboveMarks,
												tooltip,
												$$slots: { aboveMarks: true, tooltip: true }
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

				var node_6 = $.sibling(node_1, 2);

				$.component(node_6, () => Card.Footer, ($$anchor, Card_Footer) => {
					Card_Footer($$anchor, {
						class: 'flex-col gap-0',
						children: ($$anchor, $$slotProps) => {
							var fragment_6 = root_1();
							var node_7 = $.sibling($.first_child(fragment_6), 2);

							Separator(node_7, {});

							var node_8 = $.sibling(node_7, 4);

							Separator(node_8, {});
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