import * as $ from 'svelte/internal/server';
import { Card, CardContent } from "$lib/components/ui/card";
import { cn } from "$lib/utils";

export default function Stats_01($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = [
			{
				name: "Profit",
				value: "$287,654.00",
				change: "+8.32%",
				changeType: "positive"
			},

			{
				name: "Late payments",
				value: "$9,435.00",
				change: "-12.64%",
				changeType: "negative"
			},

			{
				name: "Pending orders",
				value: "$173,229.00",
				change: "+2.87%",
				changeType: "positive"
			},

			{
				name: "Operating costs",
				value: "$52,891.00",
				change: "-5.73%",
				changeType: "negative"
			}
		];

		$$renderer.push(`<div class="flex items-center justify-center p-10"><div class="mx-auto grid grid-cols-1 gap-px rounded-xl bg-border sm:grid-cols-2 lg:grid-cols-4"><!--[-->`);

		const each_array = $.ensure_array_like(data);

		for (let index = 0, $$length = each_array.length; index < $$length; index++) {
			let stat = each_array[index];

			Card($$renderer, {
				class: cn("rounded-none border-0 py-0 shadow-none", index === 0 && "rounded-l-xl", index === data.length - 1 && "rounded-r-xl"),
				children: ($$renderer) => {
					CardContent($$renderer, {
						class: 'flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 p-4 sm:p-6',
						children: ($$renderer) => {
							$$renderer.push(`<div class="text-sm font-medium text-muted-foreground">${$.escape(stat.name)}</div> <div${$.attr_class($.clsx(cn("text-xs font-medium", stat.changeType === "positive"
								? "text-green-800 dark:text-green-400"
								: "text-red-800 dark:text-red-400")))}>${$.escape(stat.change)}</div> <div class="w-full flex-none text-3xl font-medium tracking-tight text-foreground">${$.escape(stat.value)}</div>`);
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