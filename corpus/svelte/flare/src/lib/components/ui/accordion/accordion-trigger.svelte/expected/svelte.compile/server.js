import * as $ from 'svelte/internal/server';
import { Accordion as AccordionPrimitive } from 'bits-ui';
import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
import { cn } from '$lib/utils.js';

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
									'data-slot': 'accordion-trigger',
									class: cn('focus-visible:border-ring focus-visible:ring-ring/50 flex flex-1 items-start justify-between gap-4 rounded-md py-4 text-left text-sm font-medium transition-all outline-none hover:underline focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&[data-state=open]>svg]:rotate-180', className)
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

										ChevronDownIcon($$renderer, {
											class: 'text-muted-foreground pointer-events-none size-4 shrink-0 translate-y-0.5 transition-transform duration-200'
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