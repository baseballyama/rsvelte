import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import MinusIcon from "@lucide/svelte/icons/minus";
import PlusIcon from "@lucide/svelte/icons/plus";
import { scaleBand } from "d3-scale";
import { BarChart } from "layerchart";
import { cubicInOut } from "svelte/easing";
import * as Card from "$lib/registry/ui/card/index.js";
import * as Chart from "$lib/registry/ui/chart/index.js";
import { Button } from "$lib/registry/ui/button/index.js";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <span class="sr-only">Decrease</span>`, 1);
var root_2 = $.from_html(`<!> <span class="sr-only">Increase</span>`, 1);
var root_3 = $.from_html(`<div class="flex items-center justify-center gap-4"><!> <div class="text-center"><div class="text-4xl font-bold tracking-tighter tabular-nums"> </div> <div class="text-xs text-muted-foreground uppercase">Calories/day</div></div> <!></div> <div class="flex-1"><!></div>`, 1);
var root_4 = $.from_html(`<!> <!> <!>`, 1);

export default function Activity_goal($$anchor, $$props) {
	$.push($$props, true);

	const data = [
		{ goal: 400 },
		{ goal: 300 },
		{ goal: 200 },
		{ goal: 300 },
		{ goal: 200 },
		{ goal: 278 },
		{ goal: 189 },
		{ goal: 239 },
		{ goal: 300 },
		{ goal: 200 },
		{ goal: 278 },
		{ goal: 189 },
		{ goal: 349 }
	];

	const chartConfig = { goal: { label: "Goal", color: "var(--primary)" } };
	let goal = $.state(350);

	function onClick(adjustment) {
		$.set(goal, Math.max(200, Math.min(400, $.get(goal) + adjustment)), true);
	}

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Card.Root, ($$anchor, Card_Root) => {
		Card_Root($$anchor, {
			class: 'w-full gap-5',
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_4();
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

										var text = $.text('Move Goal');

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

										var text_1 = $.text('Set your daily activity goal.');

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
						class: 'flex flex-1 flex-col',
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root_3();
							var div = $.first_child(fragment_3);
							var node_5 = $.child(div);

							{
								let $0 = $.derived(() => $.get(goal) <= 200);

								Button(node_5, {
									variant: 'outline',
									size: 'icon',
									class: 'size-7 rounded-full',
									onclick: () => onClick(-10),
									get disabled() {
										return $.get($0);
									},

									children: ($$anchor, $$slotProps) => {
										var fragment_4 = root_1();
										var node_6 = $.first_child(fragment_4);

										MinusIcon(node_6, {});
										$.next(2);
										$.append($$anchor, fragment_4);
									},
									$$slots: { default: true }
								});
							}

							var div_1 = $.sibling(node_5, 2);
							var div_2 = $.child(div_1);
							var text_2 = $.only_child(div_2, true);

							$.next(2);
							$.reset(div_1);

							var node_7 = $.sibling(div_1, 2);

							{
								let $0 = $.derived(() => $.get(goal) >= 400);

								Button(node_7, {
									variant: 'outline',
									size: 'icon',
									class: 'size-7 rounded-full',
									onclick: () => onClick(10),
									get disabled() {
										return $.get($0);
									},

									children: ($$anchor, $$slotProps) => {
										var fragment_5 = root_2();
										var node_8 = $.first_child(fragment_5);

										PlusIcon(node_8, {});
										$.next(2);
										$.append($$anchor, fragment_5);
									},
									$$slots: { default: true }
								});
							}

							$.reset(div);

							var div_3 = $.sibling(div, 2);
							var node_9 = $.child(div_3);

							$.component(node_9, () => Chart.Container, ($$anchor, Chart_Container) => {
								Chart_Container($$anchor, {
									get config() {
										return chartConfig;
									},
									class: 'aspect-auto h-14 w-full',
									children: ($$anchor, $$slotProps) => {
										{
											let $0 = $.derived(() => data.map((d, i) => ({ goal: d.goal, index: i })));
											let $1 = $.derived(() => scaleBand().padding(0.25));

											let $2 = $.derived(() => ({
												bars: {
													stroke: "none",
													rounded: "all",
													radius: 4,
													motion: { type: "tween", duration: 500, easing: cubicInOut },
													fill: "var(--color-goal)"
												},
												highlight: { area: { fill: "none" } }
											}));

											BarChart($$anchor, {
												get data() {
													return $.get($0);
												},
												y: 'goal',
												x: 'index',
												get xScale() {
													return $.get($1);
												},
												axis: false,
												tooltipContext: false,
												get props() {
													return $.get($2);
												}
											});
										}
									},
									$$slots: { default: true }
								});
							});

							$.reset(div_3);
							$.template_effect(() => $.set_text(text_2, $.get(goal)));
							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});
				});

				var node_10 = $.sibling(node_4, 2);

				$.component(node_10, () => Card.Footer, ($$anchor, Card_Footer) => {
					Card_Footer($$anchor, {
						children: ($$anchor, $$slotProps) => {
							Button($$anchor, {
								class: 'w-full',
								variant: 'secondary',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_3 = $.text('Set Goal');

									$.append($$anchor, text_3);
								},
								$$slots: { default: true }
							});
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