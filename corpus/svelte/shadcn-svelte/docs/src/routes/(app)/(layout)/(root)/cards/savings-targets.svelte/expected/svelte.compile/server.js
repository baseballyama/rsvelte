import * as $ from 'svelte/internal/server';

import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle
} from "$lib/registry/ui/card/index.js";

import { Item, ItemContent, ItemDescription, ItemFooter, ItemGroup } from "$lib/registry/ui/item/index.js";
import { Progress } from "$lib/registry/ui/progress/index.js";

export default function Savings_targets($$renderer) {
	Card($$renderer, {
		children: ($$renderer) => {
			CardHeader($$renderer, {
				children: ($$renderer) => {
					CardTitle($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Savings Targets`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					CardDescription($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Active milestones for 2024 across your portfolio. Monitor how close you are to each savings
			goal.`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			CardContent($$renderer, {
				children: ($$renderer) => {
					ItemGroup($$renderer, {
						class: 'gap-3',
						children: ($$renderer) => {
							Item($$renderer, {
								role: 'listitem',
								variant: 'muted',
								class: 'flex-col items-stretch',
								children: ($$renderer) => {
									ItemContent($$renderer, {
										class: 'gap-3',
										children: ($$renderer) => {
											ItemDescription($$renderer, {
												class: 'cn-font-heading text-xs font-medium tracking-wider text-muted-foreground uppercase',
												children: ($$renderer) => {
													$$renderer.push(`<!---->Retirement`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----> <span class="text-3xl font-semibold tabular-nums">$420,000</span> `);
											Progress($$renderer, { value: 65, 'aria-label': 'Retirement savings progress' });
											$$renderer.push(`<!---->`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									ItemFooter($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<span class="text-sm text-muted-foreground">65% achieved</span> <span class="text-sm font-medium tabular-nums">$273,000</span>`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!---->`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Item($$renderer, {
								role: 'listitem',
								variant: 'muted',
								class: 'flex-col items-stretch',
								children: ($$renderer) => {
									ItemContent($$renderer, {
										class: 'gap-3',
										children: ($$renderer) => {
											ItemDescription($$renderer, {
												class: 'cn-font-heading text-xs font-medium tracking-wider text-muted-foreground uppercase',
												children: ($$renderer) => {
													$$renderer.push(`<!---->Real Estate`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----> <span class="text-3xl font-semibold tabular-nums">$85,000</span> `);
											Progress($$renderer, { value: 32, 'aria-label': 'Real estate savings progress' });
											$$renderer.push(`<!---->`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									ItemFooter($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<span class="text-sm text-muted-foreground">32% achieved</span> <span class="text-sm font-medium tabular-nums">$27,200</span>`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!---->`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			CardFooter($$renderer, {
				children: ($$renderer) => {
					CardDescription($$renderer, {
						class: 'text-center',
						children: ($$renderer) => {
							$$renderer.push(`<!---->You have not met your targets for this year.`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}