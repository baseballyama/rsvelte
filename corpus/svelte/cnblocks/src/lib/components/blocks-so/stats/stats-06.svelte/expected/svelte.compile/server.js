import * as $ from 'svelte/internal/server';
import { Card, CardContent } from "$lib/components/ui/card";
import { cn } from "$lib/utils";
import AlertTriangle from "@lucide/svelte/icons/alert-triangle";
import Check from "@lucide/svelte/icons/check";
import ChevronRight from "@lucide/svelte/icons/chevron-right";
import Eye from "@lucide/svelte/icons/eye";

export default function Stats_06($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const data = [
			{
				name: "Europe",
				stat: "$10,023",
				goalsAchieved: 3,
				status: "observe",
				href: "#"
			},

			{
				name: "North America",
				stat: "$14,092",
				goalsAchieved: 5,
				status: "within",
				href: "#"
			},

			{
				name: "Asia",
				stat: "$113,232",
				goalsAchieved: 1,
				status: "critical",
				href: "#"
			}
		];

		$$renderer.push(`<div class="flex w-full items-center justify-center p-10"><dl class="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"><!--[-->`);

		const each_array = $.ensure_array_like(data);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let item = each_array[$$index];

			Card($$renderer, {
				class: 'relative p-6',
				children: ($$renderer) => {
					CardContent($$renderer, {
						class: 'p-0',
						children: ($$renderer) => {
							$$renderer.push(`<dt class="text-sm font-medium text-muted-foreground">${$.escape(item.name)}</dt> <dd class="text-3xl font-semibold text-foreground">${$.escape(item.stat)}</dd> <div class="group relative mt-6 flex items-center space-x-4 rounded-md bg-muted/60 p-2 hover:bg-muted"><div class="flex w-full items-center justify-between truncate"><div class="flex items-center space-x-3"><span${$.attr_class($.clsx(cn("flex h-9 w-9 shrink-0 items-center justify-center rounded", item.status === "within"
								? "bg-emerald-500 text-white"
								: item.status === "observe" ? "bg-yellow-500 text-white" : "bg-red-500 text-white")))}>`);

							if (item.status === "within") {
								$$renderer.push('<!--[0-->');
								Check($$renderer, { class: 'size-4 shrink-0', 'aria-hidden': true });
							} else if (item.status === "observe") {
								$$renderer.push('<!--[1-->');
								Eye($$renderer, { class: 'size-4 shrink-0', 'aria-hidden': true });
							} else {
								$$renderer.push('<!--[-1-->');
								AlertTriangle($$renderer, { class: 'size-4 shrink-0', 'aria-hidden': true });
							}

							$$renderer.push(`<!--]--></span> <dd><p class="text-sm text-muted-foreground"><a${$.attr('href', item.href)} class="focus:outline-none"><span class="absolute inset-0"${$.attr('aria-hidden', true)}></span> ${$.escape(item.goalsAchieved)}/5 goals</a></p> <p${$.attr_class($.clsx(cn("text-sm font-medium", item.status === "within"
								? "text-emerald-800 dark:text-emerald-500"
								: item.status === "observe"
									? "text-yellow-800 dark:text-yellow-500"
									: "text-red-800 dark:text-red-500")))}>${$.escape(item.status)}</p></dd></div> `);

							ChevronRight($$renderer, {
								class: 'size-5 shrink-0 text-muted-foreground/60 group-hover:text-muted-foreground',
								'aria-hidden': true
							});

							$$renderer.push(`<!----></div></div>`);
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