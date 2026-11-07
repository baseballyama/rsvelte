import * as $ from 'svelte/internal/server';
import { Select as SelectPrimitive } from "bits-ui";
import ChevronDown from "@lucide/svelte/icons/chevron-down";
import { cn } from "$lib/utils.js";

export default function Select_trigger($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (SelectPrimitive.Trigger) {
				$$renderer.push('<!--[-->');

				SelectPrimitive.Trigger($$renderer, $.spread_props([
					{
						class: cn("flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-sm ring-offset-background focus:ring-1 focus:ring-ring focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 data-[placeholder]:text-muted-foreground [&>span]:line-clamp-1", className)
					},
					restProps,
					{
						get ref() {
							return ref;
						},

						set ref($$value) {
							ref = $$value;
							$$settled = false;
						},

						children: ($$renderer) => {
							children?.($$renderer);
							$$renderer.push(`<!----> `);
							ChevronDown($$renderer, { class: 'size-4 opacity-50' });
							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
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