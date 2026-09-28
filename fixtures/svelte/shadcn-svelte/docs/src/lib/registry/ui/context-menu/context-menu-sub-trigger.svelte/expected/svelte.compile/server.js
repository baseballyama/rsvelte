import * as $ from 'svelte/internal/server';
import { ContextMenu as ContextMenuPrimitive } from "bits-ui";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { cn } from "$lib/utils.js";

export default function Context_menu_sub_trigger($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			inset,
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (ContextMenuPrimitive.SubTrigger) {
				$$renderer.push('<!--[-->');

				ContextMenuPrimitive.SubTrigger($$renderer, $.spread_props([
					{
						'data-slot': 'context-menu-sub-trigger',
						'data-inset': inset,
						class: cn("cn-context-menu-sub-trigger flex cursor-default items-center outline-hidden select-none data-inset:ps-8 [&_svg]:pointer-events-none [&_svg]:shrink-0", className)
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
								class: 'ml-auto'
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