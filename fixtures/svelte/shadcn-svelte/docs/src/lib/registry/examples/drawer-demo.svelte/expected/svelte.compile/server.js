import * as $ from 'svelte/internal/server';
import MinusIcon from "@lucide/svelte/icons/minus";
import PlusIcon from "@lucide/svelte/icons/plus";
import { scaleBand } from "d3-scale";
import { BarChart } from "layerchart";
import { cubicInOut } from "svelte/easing";
import * as Drawer from "$lib/registry/ui/drawer/index.js";
import { Button, buttonVariants } from "$lib/registry/ui/button/index.js";

export default function Drawer_demo($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
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

		let goal = 350;

		function handleClick(adjustment) {
			goal = Math.max(200, Math.min(400, goal + adjustment));
		}

		if (Drawer.Root) {
			$$renderer.push('<!--[-->');

			Drawer.Root($$renderer, {
				children: ($$renderer) => {
					if (Drawer.Trigger) {
						$$renderer.push('<!--[-->');

						Drawer.Trigger($$renderer, {
							class: buttonVariants({ variant: "outline" }),
							children: ($$renderer) => {
								$$renderer.push(`<!---->Open Drawer`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (Drawer.Content) {
						$$renderer.push('<!--[-->');

						Drawer.Content($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<div class="mx-auto w-full max-w-sm">`);

								if (Drawer.Header) {
									$$renderer.push('<!--[-->');

									Drawer.Header($$renderer, {
										children: ($$renderer) => {
											if (Drawer.Title) {
												$$renderer.push('<!--[-->');

												Drawer.Title($$renderer, {
													children: ($$renderer) => {
														$$renderer.push(`<!---->Move Goal`);
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											if (Drawer.Description) {
												$$renderer.push('<!--[-->');

												Drawer.Description($$renderer, {
													children: ($$renderer) => {
														$$renderer.push(`<!---->Set your daily activity goal.`);
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` <div class="p-4 pb-0"><div class="flex items-center justify-center space-x-2">`);

								Button($$renderer, {
									variant: 'outline',
									size: 'icon',
									class: 'size-8 shrink-0 rounded-full',
									onclick: () => handleClick(-10),
									disabled: goal <= 200,
									children: ($$renderer) => {
										MinusIcon($$renderer, {});
										$$renderer.push(`<!----> <span class="sr-only">Decrease</span>`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> <div class="flex-1 text-center"><div class="text-7xl font-bold tracking-tighter">${$.escape(goal)}</div> <div class="text-[0.70rem] text-muted-foreground uppercase">Calories/day</div></div> `);

								Button($$renderer, {
									variant: 'outline',
									size: 'icon',
									class: 'size-8 shrink-0 rounded-full',
									onclick: () => handleClick(10),
									disabled: goal >= 400,
									children: ($$renderer) => {
										PlusIcon($$renderer, {});
										$$renderer.push(`<!----> <span class="sr-only">Increase</span>`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----></div> <div class="mt-3 h-[120px]"><div class="h-full w-full">`);

								BarChart($$renderer, {
									data: data.map((d, i) => ({ goal: d.goal, index: i })),
									y: 'goal',
									x: 'index',
									xScale: scaleBand().padding(0.25),
									axis: false,
									tooltipContext: false,
									props: {
										bars: {
											stroke: "none",
											rounded: "all",
											radius: 4,
											motion: { type: "tween", duration: 500, easing: cubicInOut },
											fill: "var(--color-foreground)",
											fillOpacity: 0.9
										},
										highlight: { area: { fill: "none" } }
									}
								});

								$$renderer.push(`<!----></div></div></div> `);

								if (Drawer.Footer) {
									$$renderer.push('<!--[-->');

									Drawer.Footer($$renderer, {
										children: ($$renderer) => {
											Button($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<!---->Submit`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----> `);

											if (Drawer.Close) {
												$$renderer.push('<!--[-->');

												Drawer.Close($$renderer, {
													class: buttonVariants({ variant: "outline" }),
													children: ($$renderer) => {
														$$renderer.push(`<!---->Cancel`);
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(`</div>`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}
	});
}