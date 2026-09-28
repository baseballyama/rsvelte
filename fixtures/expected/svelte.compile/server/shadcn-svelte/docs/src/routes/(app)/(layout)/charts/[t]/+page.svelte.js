import * as $ from 'svelte/internal/server';
import ChartDisplay from "$lib/components/chart-display.svelte";
import { cn } from "$lib/utils.js";
import { charts } from "../charts.js";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;
		const chartList = $.derived(() => charts[data.type]);

		$$renderer.push(`<div class="grid flex-1 gap-12 lg:gap-24"><h2 class="sr-only">${$.escape(data.type.charAt(0).toUpperCase() + data.type.slice(1))} Charts</h2> <div class="grid flex-1 scroll-mt-20 items-stretch gap-10 md:grid-cols-2 md:gap-6 lg:grid-cols-3 xl:gap-10"><!--[-->`);

		const each_array = $.ensure_array_like({ length: 12 });

		for (let index = 0, $$length = each_array.length; index < $$length; index++) {
			let _ = each_array[index];
			const chart = chartList()[index];

			if (chart) {
				$$renderer.push('<!--[0-->');

				ChartDisplay($$renderer, {
					name: chart.id,
					class: cn(chart.fullWidth && "md:col-span-2 lg:col-span-3"),
					chartData: data.charts,
					children: ($$renderer) => {
						if (chart.component) {
							$$renderer.push('<!--[-->');
							chart.component($$renderer, {});
							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					},
					$$slots: { default: true }
				});
			} else {
				$$renderer.push(`<!--[-1--><div class="hidden aspect-square w-full rounded-lg border border-dashed xl:block"></div>`);
			}

			$$renderer.push(`<!--]-->`);
		}

		$$renderer.push(`<!--]--></div></div>`);
	});
}