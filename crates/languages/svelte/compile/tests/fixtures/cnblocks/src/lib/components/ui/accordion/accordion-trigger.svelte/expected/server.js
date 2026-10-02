import * as $ from 'svelte/internal/server';
import { Accordion as AccordionPrimitive } from "bits-ui";
import ChevronDown from "@lucide/svelte/icons/chevron-down";
import { cn } from "$lib/utils.js";

export default function Accordion_trigger($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			level = 3,
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (AccordionPrimitive.Header) {
				$$renderer.push('<!--[-->');

				AccordionPrimitive.Header($$renderer, {
					level,
					class: 'flex',
					children: ($$renderer) => {
						if (AccordionPrimitive.Trigger) {
							$$renderer.push('<!--[-->');

							AccordionPrimitive.Trigger($$renderer, $.spread_props([
								{
									class: cn("flex flex-1 items-center justify-between py-4 text-sm font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180", className)
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

										ChevronDown($$renderer, {
											class: 'size-4 shrink-0 text-muted-foreground transition-transform duration-200'
										});

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
					},
					$$slots: { default: true }
				});

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