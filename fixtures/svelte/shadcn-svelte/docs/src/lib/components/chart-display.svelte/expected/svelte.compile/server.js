import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils.js";
import ChartToolbar from "./chart-toolbar.svelte";

export default function Chart_display($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { name, class: className, children, chartData } = $$props;
		const chart = $.derived(() => chartData.find((c) => c.name === name));

		if (chart()) {
			$$renderer.push(`<!--[0--><div${$.attr_class($.clsx(cn("themes-wrapper group relative flex flex-col overflow-hidden rounded-xl border transition-all duration-200 ease-in-out hover:z-30", className)))}>`);

			ChartToolbar($$renderer, {
				chart: chart(),
				class: 'relative z-20 flex justify-end border-b bg-card px-3 py-2.5 text-card-foreground',
				children: ($$renderer) => {
					children?.($$renderer);
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <div class="relative z-10 [&amp;>div]:rounded-none [&amp;>div]:border-none [&amp;>div]:shadow-none">`);
			children?.($$renderer);
			$$renderer.push(`<!----></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}