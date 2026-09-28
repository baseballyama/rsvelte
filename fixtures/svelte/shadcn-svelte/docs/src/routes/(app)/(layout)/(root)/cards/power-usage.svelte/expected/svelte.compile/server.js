import * as $ from 'svelte/internal/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "$lib/registry/ui/card/index.js";
import { Separator } from "$lib/registry/ui/separator/index.js";

export default function Power_usage($$renderer) {
	const chartData = [
		{ hour: "6a", usage: 1.2 },
		{ hour: "8a", usage: 2.8 },
		{ hour: "10a", usage: 3.1 },
		{ hour: "12p", usage: 2.4 },
		{ hour: "2p", usage: 3.4 },
		{ hour: "4p", usage: 2.9 },
		{ hour: "6p", usage: 3.8 },
		{ hour: "8p", usage: 3.2 }
	];

	const maxUsage = Math.max(...chartData.map((item) => item.usage));

	Card($$renderer, {
		children: ($$renderer) => {
			CardHeader($$renderer, {
				children: ($$renderer) => {
					CardTitle($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Power Usage`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					CardDescription($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Whole Home`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			CardContent($$renderer, {
				class: 'flex flex-col gap-4',
				children: ($$renderer) => {
					$$renderer.push(`<div class="flex h-[140px] w-full items-end gap-2" role="img" aria-label="Power usage by hour"><!--[-->`);

					const each_array = $.ensure_array_like(chartData);

					for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
						let item = each_array[$$index];

						$$renderer.push(`<div class="flex h-full flex-1 flex-col justify-end gap-1.5"><div class="min-h-2 rounded-t bg-chart-2"${$.attr_style(`height: ${item.usage / maxUsage * 100}%`)}></div> <span class="text-center text-xs text-muted-foreground">${$.escape(item.hour)}</span></div>`);
					}

					$$renderer.push(`<!--]--></div> `);
					Separator($$renderer, {});
					$$renderer.push(`<!----> <div class="grid grid-cols-2 gap-4"><div class="flex flex-col gap-0.5"><span class="text-sm text-muted-foreground">Currently Using</span> <span class="text-lg font-semibold tabular-nums">3.4 kW</span></div> <div class="flex flex-col gap-0.5"><span class="text-sm text-muted-foreground">Solar Gen</span> <span class="text-lg font-semibold tabular-nums">+1.2 kW</span></div></div>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}