import * as $ from 'svelte/internal/server';
import { Badge } from "$lib/components/ui/badge";
import { Card, CardContent } from "$lib/components/ui/card";
import { cn } from "$lib/utils";
import TrendingDown from "@lucide/svelte/icons/trending-down";
import TrendingUp from "@lucide/svelte/icons/trending-up";

export default function Stats_04($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = [
			{
				name: "Daily active users",
				stat: "3,450",
				change: "+12.1%",
				changeType: "positive"
			},

			{
				name: "Weekly sessions",
				stat: "1,342",
				change: "-9.8%",
				changeType: "negative"
			},

			{
				name: "Duration",
				stat: "5.2min",
				change: "+7.7%",
				changeType: "positive"
			}
		];

		$$renderer.push(`<div class="flex w-full items-center justify-center p-10"><dl class="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"><!--[-->`);

		const each_array = $.ensure_array_like(data);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let item = each_array[$$index];

			Card($$renderer, {
				class: 'w-full p-6 py-4',
				children: ($$renderer) => {
					CardContent($$renderer, {
						class: 'p-0',
						children: ($$renderer) => {
							$$renderer.push(`<div class="flex items-center justify-between"><dt class="text-sm font-medium text-muted-foreground">${$.escape(item.name)}</dt> `);

							Badge($$renderer, {
								variant: 'outline',
								class: cn("inline-flex items-center px-1.5 py-0.5 ps-2.5 text-xs font-medium", item.changeType === "positive"
									? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
									: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"),

								children: ($$renderer) => {
									if (item.changeType === "positive") {
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

									$$renderer.push(`<!--]--> <span class="sr-only">${$.escape(item.changeType === "positive" ? "Increased" : "Decreased")} by</span> ${$.escape(item.change)}`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----></div> <dd class="mt-2 text-3xl font-semibold text-foreground">${$.escape(item.stat)}</dd>`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});
		}

		$$renderer.push(`<!--]--></dl></div>`);
	});
}