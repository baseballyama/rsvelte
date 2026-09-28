import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils.js";

export default function Chart_tooltip_demo_item($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			hideLabel = false,
			indicator = "dot",
			hideIndicator = false,
			label,
			labelClassName,
			payload,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const nestLabel = $.derived(() => payload.length === 1 && indicator === "dot");

		function TooltipLabel($$renderer) {
			if (label && !hideLabel) {
				$$renderer.push(`<!--[0--><div${$.attr_class($.clsx(cn("font-medium", labelClassName)))}>${$.escape(label)}</div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		}

		$$renderer.push(`<div${$.attributes({
			class: $.clsx(cn("grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl", className)),
			...restProps
		})}>`);

		if (!nestLabel()) {
			$$renderer.push('<!--[0-->');
			TooltipLabel($$renderer);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <div class="grid gap-1.5"><!--[-->`);

		const each_array = $.ensure_array_like(payload);

		for (let i = 0, $$length = each_array.length; i < $$length; i++) {
			let item = each_array[i];
			const indicatorColor = item.color;

			$$renderer.push(`<div${$.attr_class($.clsx(cn("flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground", indicator === "dot" && "items-center")))}>`);

			if (!hideIndicator) {
				$$renderer.push(`<!--[0--><div${$.attr_style(`--color-bg: ${$.stringify(indicatorColor)}; --color-border: ${$.stringify(indicatorColor)};`)}${$.attr_class($.clsx(cn("shrink-0 rounded-[2px] border-(--color-border) bg-(--color-bg)", {
					"size-2.5": indicator === "dot",
					"h-full w-1": indicator === "line",
					"w-0 border-[1.5px] border-dashed bg-transparent": indicator === "dashed",
					"my-0.5": nestLabel() && indicator === "dashed"
				})))}></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> <div${$.attr_class($.clsx(cn("flex flex-1 justify-between leading-none", nestLabel() ? "items-end" : "items-center")))}><div class="grid gap-1.5">`);

			if (nestLabel()) {
				$$renderer.push('<!--[0-->');
				TooltipLabel($$renderer);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> <span class="text-muted-foreground">${$.escape(item.name)}</span></div> `);

			if (item.value) {
				$$renderer.push(`<!--[0--><span class="font-mono font-medium text-foreground tabular-nums">${$.escape(item.value.toLocaleString())}</span>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div></div>`);
		}

		$$renderer.push(`<!--]--></div></div>`);
		$.bind_props($$props, { ref });
	});
}