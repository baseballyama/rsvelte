import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import MinusIcon from "@lucide/svelte/icons/minus";
import PlusIcon from "@lucide/svelte/icons/plus";
import { scaleBand } from "d3-scale";
import { BarChart } from "layerchart";
import { cubicInOut } from "svelte/easing";
import * as Drawer from "$lib/registry/ui/drawer/index.js";
import { Button, buttonVariants } from "$lib/registry/ui/button/index.js";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <span class="sr-only">Decrease</span>`, 1);
var root_2 = $.from_html(`<!> <span class="sr-only">Increase</span>`, 1);
var root_3 = $.from_html(`<div class="mx-auto w-full max-w-sm"><!> <div class="p-4 pb-0"><div class="flex items-center justify-center space-x-2"><!> <div class="flex-1 text-center"><div class="text-7xl font-bold tracking-tighter"> </div> <div class="text-[0.70rem] text-muted-foreground uppercase">Calories/day</div></div> <!></div> <div class="mt-3 h-[120px]"><div class="h-full w-full"><!></div></div></div> <!></div>`);

export default function Drawer_demo($$anchor, $$props) {
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

	let goal = $.state(350);

	function handleClick(adjustment) {
		$.set(goal, Math.max(200, Math.min(400, $.get(goal) + adjustment)), true);
	}

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Drawer.Root, ($$anchor, Drawer_Root) => {
		Drawer_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node_1 = $.first_child(fragment_1);

				{
					let $0 = $.derived(() => buttonVariants({ variant: "outline" }));

					$.component(node_1, () => Drawer.Trigger, ($$anchor, Drawer_Trigger) => {
						Drawer_Trigger($$anchor, {
							get class() {
								return $.get($0);
							},

							children: ($$anchor, $$slotProps) => {
								$.next();

								var text = $.text('Open Drawer');

								$.append($$anchor, text);
							},
							$$slots: { default: true }
						});
					});
				}

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => Drawer.Content, ($$anchor, Drawer_Content) => {
					Drawer_Content($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var div = root_3();
							var node_3 = $.child(div);

							$.component(node_3, () => Drawer.Header, ($$anchor, Drawer_Header) => {
								Drawer_Header($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_2 = root();
										var node_4 = $.first_child(fragment_2);

										$.component(node_4, () => Drawer.Title, ($$anchor, Drawer_Title) => {
											Drawer_Title($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_1 = $.text('Move Goal');

													$.append($$anchor, text_1);
												},
												$$slots: { default: true }
											});
										});

										var node_5 = $.sibling(node_4, 2);

										$.component(node_5, () => Drawer.Description, ($$anchor, Drawer_Description) => {
											Drawer_Description($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_2 = $.text('Set your daily activity goal.');

													$.append($$anchor, text_2);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_2);
									},
									$$slots: { default: true }
								});
							});

							var div_1 = $.sibling(node_3, 2);
							var div_2 = $.child(div_1);
							var node_6 = $.child(div_2);

							{
								let $0 = $.derived(() => $.get(goal) <= 200);

								Button(node_6, {
									variant: 'outline',
									size: 'icon',
									class: 'size-8 shrink-0 rounded-full',
									onclick: () => handleClick(-10),
									get disabled() {
										return $.get($0);
									},

									children: ($$anchor, $$slotProps) => {
										var fragment_3 = root_1();
										var node_7 = $.first_child(fragment_3);

										MinusIcon(node_7, {});
										$.next(2);
										$.append($$anchor, fragment_3);
									},
									$$slots: { default: true }
								});
							}

							var div_3 = $.sibling(node_6, 2);
							var div_4 = $.child(div_3);
							var text_3 = $.only_child(div_4, true);

							$.next(2);
							$.reset(div_3);

							var node_8 = $.sibling(div_3, 2);

							{
								let $0 = $.derived(() => $.get(goal) >= 400);

								Button(node_8, {
									variant: 'outline',
									size: 'icon',
									class: 'size-8 shrink-0 rounded-full',
									onclick: () => handleClick(10),
									get disabled() {
										return $.get($0);
									},

									children: ($$anchor, $$slotProps) => {
										var fragment_4 = root_2();
										var node_9 = $.first_child(fragment_4);

										PlusIcon(node_9, {});
										$.next(2);
										$.append($$anchor, fragment_4);
									},
									$$slots: { default: true }
								});
							}

							$.reset(div_2);

							var div_5 = $.sibling(div_2, 2);
							var div_6 = $.child(div_5);
							var node_10 = $.child(div_6);

							{
								let $0 = $.derived(() => data.map((d, i) => ({ goal: d.goal, index: i })));
								let $1 = $.derived(() => scaleBand().padding(0.25));

								let $2 = $.derived(() => ({
									bars: {
										stroke: "none",
										rounded: "all",
										radius: 4,
										motion: { type: "tween", duration: 500, easing: cubicInOut },
										fill: "var(--color-foreground)",
										fillOpacity: 0.9
									},
									highlight: { area: { fill: "none" } }
								}));

								BarChart(node_10, {
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

							$.reset(div_6);
							$.reset(div_5);
							$.reset(div_1);

							var node_11 = $.sibling(div_1, 2);

							$.component(node_11, () => Drawer.Footer, ($$anchor, Drawer_Footer) => {
								Drawer_Footer($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_5 = root();
										var node_12 = $.first_child(fragment_5);

										Button(node_12, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_4 = $.text('Submit');

												$.append($$anchor, text_4);
											},
											$$slots: { default: true }
										});

										var node_13 = $.sibling(node_12, 2);

										{
											let $0 = $.derived(() => buttonVariants({ variant: "outline" }));

											$.component(node_13, () => Drawer.Close, ($$anchor, Drawer_Close) => {
												Drawer_Close($$anchor, {
													get class() {
														return $.get($0);
													},

													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_5 = $.text('Cancel');

														$.append($$anchor, text_5);
													},
													$$slots: { default: true }
												});
											});
										}

										$.append($$anchor, fragment_5);
									},
									$$slots: { default: true }
								});
							});

							$.reset(div);
							$.template_effect(() => $.set_text(text_3, $.get(goal)));
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