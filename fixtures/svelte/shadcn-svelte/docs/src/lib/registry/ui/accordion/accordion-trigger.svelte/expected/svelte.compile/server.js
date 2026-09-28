import * as $ from 'svelte/internal/server';
import { Accordion as AccordionPrimitive } from "bits-ui";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
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
									'data-slot': 'accordion-trigger',
									class: cn("cn-accordion-trigger group/accordion-trigger relative flex flex-1 items-start justify-between border border-transparent transition-all outline-none disabled:pointer-events-none disabled:opacity-50", className)
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

										IconPlaceholder($$renderer, {
											lucide: 'ChevronDownIcon',
											tabler: 'IconChevronDown',
											'data-slot': 'accordion-trigger-icon',
											hugeicons: 'ArrowDown01Icon',
											phosphor: 'CaretDownIcon',
											remixicon: 'RiArrowDownSLine',
											class: 'cn-accordion-trigger-icon pointer-events-none shrink-0 group-aria-expanded/accordion-trigger:hidden'
										});

										$$renderer.push(`<!----> `);

										IconPlaceholder($$renderer, {
											lucide: 'ChevronUpIcon',
											tabler: 'IconChevronUp',
											'data-slot': 'accordion-trigger-icon',
											hugeicons: 'ArrowUp01Icon',
											phosphor: 'CaretUpIcon',
											remixicon: 'RiArrowUpSLine',
											class: 'cn-accordion-trigger-icon pointer-events-none hidden shrink-0 group-aria-expanded/accordion-trigger:inline'
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