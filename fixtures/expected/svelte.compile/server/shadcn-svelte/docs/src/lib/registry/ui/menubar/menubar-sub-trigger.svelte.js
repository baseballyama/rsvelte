import * as $ from 'svelte/internal/server';
import { Menubar as MenubarPrimitive } from "bits-ui";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { cn } from "$lib/utils.js";

export default function Menubar_sub_trigger($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			inset = undefined,
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (MenubarPrimitive.SubTrigger) {
				$$renderer.push('<!--[-->');

				MenubarPrimitive.SubTrigger($$renderer, $.spread_props([
					{
						'data-slot': 'menubar-sub-trigger',
						'data-inset': inset,
						class: cn("cn-menubar-sub-trigger flex cursor-default items-center outline-none select-none", className)
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
								lucide: 'ChevronRightIcon',
								tabler: 'IconChevronRight',
								hugeicons: 'ArrowRight01Icon',
								phosphor: 'CaretRightIcon',
								remixicon: 'RiArrowRightSLine',
								class: 'cn-rtl-flip ml-auto size-4'
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