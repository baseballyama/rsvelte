import * as $ from 'svelte/internal/server';
import { Tabs as TabsPrimitive } from "bits-ui";
import { cn } from "$lib/utils.js";
import { tv } from "tailwind-variants";

export const tabsListVariants = tv({
	base: "cn-tabs-list group/tabs-list inline-flex w-fit items-center justify-center text-muted-foreground group-data-[orientation=vertical]/tabs:h-fit group-data-[orientation=vertical]/tabs:flex-col",
	variants: {
		variant: {
			default: "cn-tabs-list-variant-default bg-muted",
			line: "cn-tabs-list-variant-line gap-1 bg-transparent"
		}
	},
	defaultVariants: { variant: "default" }
});

export default function Tabs_list($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			variant = "default",
			class: className,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (TabsPrimitive.List) {
				$$renderer.push('<!--[-->');

				TabsPrimitive.List($$renderer, $.spread_props([
					{
						'data-slot': 'tabs-list',
						'data-variant': variant,
						class: cn(tabsListVariants({ variant }), className)
					},
					restProps,
					{
						get ref() {
							return ref;
						},

						set ref($$value) {
							ref = $$value;
							$$settled = false;
						}
					}
				]));

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { ref });
	});
}