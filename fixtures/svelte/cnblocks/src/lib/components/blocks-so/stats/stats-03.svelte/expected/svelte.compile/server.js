import * as $ from 'svelte/internal/server';
import { Card, CardContent } from "$lib/components/ui/card";
import { cn } from "$lib/utils";

export default function Stats_03($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = [
			{
				name: "Unique visitors",
				stat: "10,450",
				change: "-12.5%",
				changeType: "negative"
			},

			{
				name: "Bounce rate",
				stat: "56.1%",
				change: "+1.8%",
				changeType: "positive"
			},

			{
				name: "Visit duration",
				stat: "5.2min",
				change: "+19.7%",
				changeType: "positive"
			},

			{
				name: "Conversion rate",
				stat: "3.2%",
				change: "-2.4%",
				changeType: "negative"
			}
		];

		$$renderer.push(`<div class="flex w-full items-center justify-center p-10"><dl class="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"><!--[-->`);

		const each_array = $.ensure_array_like(data);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let item = each_array[$$index];

			Card($$renderer, {
				class: 'p-6 py-4',
				children: ($$renderer) => {
					CardContent($$renderer, {
						class: 'p-0',
						children: ($$renderer) => {
							$$renderer.push(`<dt class="text-sm font-medium text-muted-foreground">${$.escape(item.name)}</dt> <dd class="mt-2 flex items-baseline space-x-2.5"><span class="text-3xl font-semibold text-foreground">${$.escape(item.stat)}</span> <span${$.attr_class($.clsx(cn(
								item.changeType === "positive"
									? "text-green-800 dark:text-green-400"
									: "text-red-800 dark:text-red-400",
								"text-sm font-medium"
							)))}>${$.escape(item.change)}</span></dd>`);
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