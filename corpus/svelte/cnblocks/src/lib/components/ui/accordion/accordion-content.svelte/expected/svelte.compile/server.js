import * as $ from 'svelte/internal/server';
import { Accordion as AccordionPrimitive } from "bits-ui";
import { cn } from "$lib/utils.js";

export default function Accordion_content($$renderer, $$props) {
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
			if (AccordionPrimitive.Content) {
				$$renderer.push('<!--[-->');

				AccordionPrimitive.Content($$renderer, $.spread_props([
					{
						class: cn("overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down", className)
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
							$$renderer.push(`<div class="pt-0 pb-4">`);
							children?.($$renderer);
							$$renderer.push(`<!----></div>`);
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