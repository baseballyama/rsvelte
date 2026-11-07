import * as $ from 'svelte/internal/server';
import { Card, CardContent } from "$lib/components/ui/card";
import { cn } from "$lib/utils";

export default function Stats_13($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const defaultSegments = [
			{ label: "Documents", value: 2400, color: "bg-blue-500" },
			{ label: "Photos", value: 1800, color: "bg-emerald-500" },
			{ label: "Videos", value: 3200, color: "bg-amber-500" },
			{ label: "Music", value: 900, color: "bg-purple-500" }
		];

		let {
			title = "Using Storage",
			used = 8300,
			total = 15,
			usedLabel = "MB",
			totalLabel = "GB",
			segments = defaultSegments,
			class: className
		} = $$props;

		Card($$renderer, {
			class: cn("w-full max-w-4xl shadow-sm", className),
			children: ($$renderer) => {
				CardContent($$renderer, {
					class: 'py-0',
					children: ($$renderer) => {
						$$renderer.push(`<p class="mb-4 text-base text-muted-foreground">${$.escape(title)}  <span class="font-semibold text-foreground tabular-nums">${$.escape(used.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 }))} 
				${$.escape(usedLabel)}</span> 
			of ${$.escape(total)}
			${$.escape(totalLabel)}</p> <div class="mb-4 flex h-2.5 w-full overflow-hidden rounded-full bg-muted"><!--[-->`);

						const each_array = $.ensure_array_like(segments);

						for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
							let segment = each_array[$$index];
							const percentage = segment.value / (total * 1000) * 100;

							$$renderer.push(`<div${$.attr_class($.clsx(cn("h-full", segment.color)))}${$.attr_style(`width: ${$.stringify(percentage)}%`)} role="progressbar"${$.attr('aria-label', segment.label)}${$.attr('aria-valuenow', segment.value)}${$.attr('aria-valuemin', 0)}${$.attr('aria-valuemax', total * 1000)}></div>`);
						}

						$$renderer.push(`<!--]--></div> <div class="flex flex-wrap items-center gap-x-8 gap-y-2"><!--[-->`);

						const each_array_1 = $.ensure_array_like(segments);

						for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
							let segment = each_array_1[$$index_1];

							$$renderer.push(`<div class="flex items-center gap-2"><span${$.attr_class($.clsx(cn("size-3 shrink-0 rounded", segment.color)))} aria-hidden="true"></span> <span class="text-sm text-muted-foreground">${$.escape(segment.label)}</span> <span class="text-sm text-muted-foreground tabular-nums">${$.escape(Math.round(segment.value))}
						${$.escape(usedLabel)}</span></div>`);
						}

						$$renderer.push(`<!--]--> <div class="flex items-center gap-2"><span class="size-3 shrink-0 rounded-sm bg-muted" aria-hidden="true"></span> <span class="text-sm text-muted-foreground">Free</span> <span class="text-sm text-muted-foreground tabular-nums">${$.escape(Math.round(total * 1000 - used))}
					${$.escape(usedLabel)}</span></div></div>`);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});
	});
}