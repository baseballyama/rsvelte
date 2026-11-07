import * as $ from 'svelte/internal/server';
import { Select as SelectPrimitive } from "bits-ui";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { cn } from "$lib/utils.js";

export default function Select_scroll_up_button($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (SelectPrimitive.ScrollUpButton) {
				$$renderer.push('<!--[-->');

				SelectPrimitive.ScrollUpButton($$renderer, $.spread_props([
					{
						'data-slot': 'select-scroll-up-button',
						class: cn("cn-select-scroll-up-button top-0 w-full", className)
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
							IconPlaceholder($$renderer, {
								lucide: 'ChevronUpIcon',
								tabler: 'IconChevronUp',
								hugeicons: 'ArrowUp01Icon',
								phosphor: 'CaretUpIcon',
								remixicon: 'RiArrowUpSLine'
							});
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