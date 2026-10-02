import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils";

export default function Stats_15($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = [
			{ label: "After 1 year", value: "$2,400", percentage: "+8.2%" },
			{
				label: "After 5 years",
				value: "$14,800",
				percentage: "+24.6%"
			},

			{
				label: "After 10 years",
				value: "$38,500",
				percentage: "+52.1%"
			}
		];

		$$renderer.push(`<div class="w-full max-w-2xs"><h3 class="text-sm font-medium text-foreground">Investment growth projection</h3> <ul role="list" class="mt-2 divide-y divide-border text-sm"><!--[-->`);

		const each_array = $.ensure_array_like(data);

		for (let index = 0, $$length = each_array.length; index < $$length; index++) {
			let item = each_array[index];

			$$renderer.push(`<li class="flex items-center justify-between py-3"><span class="text-muted-foreground">${$.escape(item.label)}</span> <span class="flex items-center gap-3 tabular-nums"><span class="text-right font-medium text-foreground">${$.escape(item.value)}</span> <span class="h-5 w-px bg-border" aria-hidden="true"></span> <span${$.attr_class($.clsx(cn("w-15 rounded px-1.5 py-1 text-center text-xs font-semibold", "bg-emerald-50 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400")))}>${$.escape(item.percentage)}</span></span></li>`);
		}

		$$renderer.push(`<!--]--></ul></div>`);
	});
}