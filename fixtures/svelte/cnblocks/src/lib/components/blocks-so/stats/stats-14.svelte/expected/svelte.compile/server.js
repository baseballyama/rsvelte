import * as $ from 'svelte/internal/server';
import { Badge } from "$lib/components/ui/badge";
import { Card, CardContent } from "$lib/components/ui/card";

export default function Stats_14($$renderer) {
	const data = [
		{
			label: "Compute",
			amount: 450,
			percentage: 52.3,
			color: "emerald"
		},

		{
			label: "Storage",
			amount: 285,
			percentage: 33.1,
			color: "amber"
		},

		{
			label: "Bandwidth",
			amount: 125,
			percentage: 14.6,
			color: "rose"
		}
	];

	const colorClasses = {
		emerald: "bg-emerald-500 dark:bg-emerald-400",
		amber: "bg-amber-500 dark:bg-amber-400",
		rose: "bg-rose-500 dark:bg-rose-400"
	};

	Card($$renderer, {
		class: 'w-full max-w-sm shadow-none',
		children: ($$renderer) => {
			CardContent($$renderer, {
				class: 'flex flex-col justify-between pt-0',
				children: ($$renderer) => {
					$$renderer.push(`<div><div class="flex items-center gap-2"><h3 class="text-sm font-bold text-foreground">Usage</h3> `);

					Badge($$renderer, {
						variant: 'secondary',
						class: 'bg-amber-50 text-amber-700 ring-1 ring-amber-500/30 dark:bg-amber-400/10 dark:text-amber-300 dark:ring-amber-400/20',
						children: ($$renderer) => {
							$$renderer.push(`<!---->+12.5%`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----></div> <p class="mt-2 flex items-baseline gap-2"><span class="text-xl text-foreground">$860</span> <span class="text-sm text-muted-foreground">this month</span></p> <div class="mt-4"><p class="text-sm font-medium text-foreground">Resource breakdown</p> <div class="mt-2 flex items-center gap-0.5"><!--[-->`);

					const each_array = $.ensure_array_like(data);

					for (let index = 0, $$length = each_array.length; index < $$length; index++) {
						let item = each_array[index];

						$$renderer.push(`<div${$.attr_class(`${$.stringify(colorClasses[item.color])} h-1.5 rounded-xs`)}${$.attr_style(`width: ${$.stringify(item.percentage)}%`)}></div>`);
					}

					$$renderer.push(`<!--]--></div></div> <ul role="list" class="mt-5 space-y-2"><!--[-->`);

					const each_array_1 = $.ensure_array_like(data);

					for (let index = 0, $$length = each_array_1.length; index < $$length; index++) {
						let item = each_array_1[index];

						$$renderer.push(`<li class="flex items-center gap-2 text-xs"><span${$.attr_class(`${$.stringify(colorClasses[item.color])} size-2.5 rounded-xs`)} aria-hidden="true"></span> <span class="text-foreground">${$.escape(item.label)}</span> <span class="text-muted-foreground">($${$.escape(item.amount)} / ${$.escape(item.percentage)}%)</span></li>`);
					}

					$$renderer.push(`<!--]--></ul></div> <p class="mt-6 text-xs text-muted-foreground">Configure limits in  <a href="/" class="text-emerald-600 hover:underline dark:text-emerald-400">resource settings.</a></p>`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}