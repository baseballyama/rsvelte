import * as $ from 'svelte/internal/server';
import { Badge } from "$lib/components/ui/badge";
import { Card, CardContent, CardTitle } from "$lib/components/ui/card";
import { cn } from "$lib/utils";
import TrendingDown from "@lucide/svelte/icons/trending-down";
import TrendingUp from "@lucide/svelte/icons/trending-up";

export default function Stats_02($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const stats = [
			{
				metric: "Active Users",
				current: "128,456",
				previous: "115,789",
				difference: "10.9%",
				trend: "up"
			},

			{
				metric: "Conversion Rate",
				current: "5.32%",
				previous: "6.18%",
				difference: "0.86%",
				trend: "down"
			},

			{
				metric: "Avg. Session Duration",
				current: "3m 42s",
				previous: "3m 15s",
				difference: "13.8%",
				trend: "up"
			}
		];

		$$renderer.push(`<div class="flex items-center justify-center p-10"><div class="grid grid-cols-1 divide-y divide-border overflow-hidden rounded-lg bg-border md:grid-cols-3 md:divide-x md:divide-y-0"><!--[-->`);

		const each_array = $.ensure_array_like(stats);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let item = each_array[$$index];

			Card($$renderer, {
				class: 'rounded-none border-0 py-0 shadow-sm',
				children: ($$renderer) => {
					CardContent($$renderer, {
						class: 'p-4 sm:p-6',
						children: ($$renderer) => {
							CardTitle($$renderer, {
								class: 'text-base font-normal',
								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(item.metric)}`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> <div class="mt-1 flex items-baseline gap-2 md:block lg:flex"><div class="flex items-baseline text-2xl font-semibold text-primary">${$.escape(item.current)} <span class="ml-2 text-sm font-medium text-muted-foreground">from ${$.escape(item.previous)}</span></div> `);

							Badge($$renderer, {
								variant: 'outline',
								class: cn("inline-flex items-center px-1.5 py-0.5 ps-2.5 text-xs font-medium md:mt-2 lg:mt-0", item.trend === "up"
									? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
									: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"),

								children: ($$renderer) => {
									if (item.trend === "up") {
										$$renderer.push('<!--[0-->');

										TrendingUp($$renderer, {
											class: 'mr-0.5 -ml-1 h-5 w-5 shrink-0 self-center text-green-500'
										});
									} else {
										$$renderer.push('<!--[-1-->');

										TrendingDown($$renderer, {
											class: 'mr-0.5 -ml-1 h-5 w-5 shrink-0 self-center text-red-500'
										});
									}

									$$renderer.push(`<!--]--> <span class="sr-only">${$.escape(item.trend === "up" ? "Increased" : "Decreased")} by</span> ${$.escape(item.difference)}`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----></div>`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});
		}

		$$renderer.push(`<!--]--></div></div>`);
	});
}