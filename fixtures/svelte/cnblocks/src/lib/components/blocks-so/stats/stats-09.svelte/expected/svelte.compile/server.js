import * as $ from 'svelte/internal/server';
import { Card, CardContent } from "$lib/components/ui/card";
import { Progress } from "$lib/components/ui/progress/index.js";

export default function Stats_09($$renderer) {
	const data = [
		{
			name: "Requests",
			stat: "996",
			limit: "10,000",
			percentage: 9.96
		},

		{
			name: "Credits",
			stat: "$672",
			limit: "$1,000",
			percentage: 67.2
		},

		{
			name: "Storage",
			stat: "1.85",
			limit: "10GB",
			percentage: 18.5
		},

		{
			name: "API Calls",
			stat: "4,328",
			limit: "5,000",
			percentage: 86.56
		}
	];

	$$renderer.push(`<div class="flex w-full items-center justify-center p-10"><dl class="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"><!--[-->`);

	const each_array = $.ensure_array_like(data);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let item = each_array[$$index];

		Card($$renderer, {
			class: 'py-4',
			children: ($$renderer) => {
				CardContent($$renderer, {
					class: '',
					children: ($$renderer) => {
						$$renderer.push(`<dt class="text-sm text-muted-foreground">${$.escape(item.name)}</dt> <dd class="text-2xl font-semibold text-foreground">${$.escape(item.stat)}</dd> `);
						Progress($$renderer, { value: item.percentage, class: 'mt-6 h-2' });
						$$renderer.push(`<!----> <dd class="mt-2 flex items-center justify-between text-sm"><span class="text-primary">${$.escape(item.percentage)}%</span> <span class="text-muted-foreground">${$.escape(item.stat)} of ${$.escape(item.limit)}</span></dd>`);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});
	}

	$$renderer.push(`<!--]--></dl></div>`);
}