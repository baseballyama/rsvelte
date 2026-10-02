import * as $ from 'svelte/internal/server';
import { Button } from "$lib/registry/ui/button/index.js";

import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle
} from "$lib/registry/ui/card/index.js";

import { Item, ItemContent, ItemDescription } from "$lib/registry/ui/item/index.js";

export default function Contribution_history($$renderer) {
	const chartData = [
		{ month: "Dec", amount: 800 },
		{ month: "Jan", amount: 1100 },
		{ month: "Feb", amount: 900 },
		{ month: "Mar", amount: 1300 },
		{ month: "Apr", amount: 750 },
		{ month: "May", amount: 1400 }
	];

	const maxAmount = Math.max(...chartData.map((item) => item.amount));

	Card($$renderer, {
		children: ($$renderer) => {
			CardHeader($$renderer, {
				children: ($$renderer) => {
					CardTitle($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Contribution History`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					CardDescription($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Last 6 months of activity`);
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
					$$renderer.push(`<div class="flex h-[200px] w-full items-end gap-3" role="img" aria-label="Last 6 months of contribution activity"><!--[-->`);

					const each_array = $.ensure_array_like(chartData);

					for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
						let item = each_array[$$index];

						$$renderer.push(`<div class="flex h-full flex-1 flex-col justify-end gap-2"><div class="min-h-2 rounded-t-md bg-chart-2"${$.attr_style(`height: ${item.amount / maxAmount * 100}%`)}></div> <span class="text-center text-xs text-muted-foreground">${$.escape(item.month)}</span></div>`);
					}

					$$renderer.push(`<!--]--></div>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			CardContent($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<div class="grid w-full grid-cols-1 gap-3 xl:grid-cols-2">`);

					Item($$renderer, {
						variant: 'muted',
						class: 'flex-col items-stretch',
						children: ($$renderer) => {
							ItemContent($$renderer, {
								class: 'gap-1',
								children: ($$renderer) => {
									ItemDescription($$renderer, {
										class: 'text-xs font-medium tracking-wider text-muted-foreground uppercase',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Upcoming`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> <span class="cn-font-heading text-base font-semibold">May 2024</span> <span class="text-sm text-muted-foreground">Scheduled</span>`);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Item($$renderer, {
						variant: 'muted',
						class: 'hidden flex-col items-stretch xl:flex',
						children: ($$renderer) => {
							ItemContent($$renderer, {
								class: 'gap-1',
								children: ($$renderer) => {
									ItemDescription($$renderer, {
										class: 'text-xs font-medium tracking-wider text-muted-foreground uppercase',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Savings Plan`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> <span class="cn-font-heading text-base font-semibold">Accelerated</span> <span class="text-sm text-muted-foreground">Recurring</span>`);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----></div>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			CardFooter($$renderer, {
				children: ($$renderer) => {
					Button($$renderer, {
						class: 'w-full',
						children: ($$renderer) => {
							$$renderer.push(`<!---->View Full Report`);
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