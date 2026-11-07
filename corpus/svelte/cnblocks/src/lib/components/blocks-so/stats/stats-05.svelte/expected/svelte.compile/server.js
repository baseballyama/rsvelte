import * as $ from 'svelte/internal/server';
import { Card, CardContent, CardFooter } from "$lib/components/ui/card";
import { cn } from "$lib/utils";

export default function Stats_05($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = [
			{
				name: "Monthly recurring revenue",
				value: "$34.1K",
				change: "+6.1%",
				changeType: "positive",
				href: "#"
			},

			{
				name: "Users",
				value: "500.1K",
				change: "+19.2%",
				changeType: "positive",
				href: "#"
			},

			{
				name: "User growth",
				value: "11.3%",
				change: "-1.2%",
				changeType: "negative",
				href: "#"
			}
		];

		$$renderer.push(`<div class="flex w-full items-center justify-center p-10"><dl class="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"><!--[-->`);

		const each_array = $.ensure_array_like(data);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let item = each_array[$$index];

			Card($$renderer, {
				class: 'gap-0 p-0',
				children: ($$renderer) => {
					CardContent($$renderer, {
						class: 'p-6',
						children: ($$renderer) => {
							$$renderer.push(`<dd class="flex items-start justify-between space-x-2"><span class="truncate text-sm text-muted-foreground">${$.escape(item.name)}</span> <span${$.attr_class($.clsx(cn("text-sm font-medium", item.changeType === "positive"
								? "text-emerald-700 dark:text-emerald-500"
								: "text-red-700 dark:text-red-500")))}>${$.escape(item.change)}</span></dd> <dd class="mt-1 text-3xl font-semibold text-foreground">${$.escape(item.value)}</dd>`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					CardFooter($$renderer, {
						class: 'flex justify-end border-t border-border p-0!',
						children: ($$renderer) => {
							$$renderer.push(`<a${$.attr('href', item.href)} class="px-6 py-3 text-sm font-medium text-primary hover:text-primary/90">View more →</a>`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});
		}

		$$renderer.push(`<!--]--></dl></div>`);
	});
}