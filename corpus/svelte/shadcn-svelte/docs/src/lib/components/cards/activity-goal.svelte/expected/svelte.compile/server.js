import * as $ from 'svelte/internal/server';
import MinusIcon from "@lucide/svelte/icons/minus";
import PlusIcon from "@lucide/svelte/icons/plus";
import { scaleBand } from "d3-scale";
import { BarChart } from "layerchart";
import { cubicInOut } from "svelte/easing";
import * as Card from "$lib/registry/ui/card/index.js";
import * as Chart from "$lib/registry/ui/chart/index.js";
import { Button } from "$lib/registry/ui/button/index.js";

export default function Activity_goal($$renderer, $$props) {
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

		const chartConfig = { goal: { label: "Goal", color: "var(--primary)" } };
		let goal = 350;

		function onClick(adjustment) {
			goal = Math.max(200, Math.min(400, goal + adjustment));
		}

		if (Card.Root) {
			$$renderer.push('<!--[-->');

			Card.Root($$renderer, {
				class: 'w-full gap-5',
				children: ($$renderer) => {
					if (Card.Header) {
						$$renderer.push('<!--[-->');

						Card.Header($$renderer, {
							children: ($$renderer) => {
								if (Card.Title) {
									$$renderer.push('<!--[-->');

									Card.Title($$renderer, {
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

								if (Card.Description) {
									$$renderer.push('<!--[-->');

									Card.Description($$renderer, {
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

					$$renderer.push(` `);

					if (Card.Content) {
						$$renderer.push('<!--[-->');

						Card.Content($$renderer, {
							class: 'flex flex-1 flex-col',
							children: ($$renderer) => {
								$$renderer.push(`<div class="flex items-center justify-center gap-4">`);

								Button($$renderer, {
									variant: 'outline',
									size: 'icon',
									class: 'size-7 rounded-full',
									onclick: () => onClick(-10),
									disabled: goal <= 200,
									children: ($$renderer) => {
										MinusIcon($$renderer, {});
										$$renderer.push(`<!----> <span class="sr-only">Decrease</span>`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> <div class="text-center"><div class="text-4xl font-bold tracking-tighter tabular-nums">${$.escape(goal)}</div> <div class="text-xs text-muted-foreground uppercase">Calories/day</div></div> `);

								Button($$renderer, {
									variant: 'outline',
									size: 'icon',
									class: 'size-7 rounded-full',
									onclick: () => onClick(10),
									disabled: goal >= 400,
									children: ($$renderer) => {
										PlusIcon($$renderer, {});
										$$renderer.push(`<!----> <span class="sr-only">Increase</span>`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----></div> <div class="flex-1">`);

								if (Chart.Container) {
									$$renderer.push('<!--[-->');

									Chart.Container($$renderer, {
										config: chartConfig,
										class: 'aspect-auto h-14 w-full',
										children: ($$renderer) => {
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
														fill: "var(--color-goal)"
													},
													highlight: { area: { fill: "none" } }
												}
											});
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

					$$renderer.push(` `);

					if (Card.Footer) {
						$$renderer.push('<!--[-->');

						Card.Footer($$renderer, {
							children: ($$renderer) => {
								Button($$renderer, {
									class: 'w-full',
									variant: 'secondary',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Set Goal`);
									},
									$$slots: { default: true }
								});
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