import * as $ from 'svelte/internal/server';
import { NavigationMenu as NavigationMenuPrimitive } from "bits-ui";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { tv } from "tailwind-variants";
import { cn } from "$lib/utils.js";

export const navigationMenuTriggerStyle = tv({
	base: "cn-navigation-menu-trigger group/navigation-menu-trigger inline-flex h-9 w-max items-center justify-center outline-none disabled:pointer-events-none"
});

export default function Navigation_menu_trigger($$renderer, $$props) {
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
			if (NavigationMenuPrimitive.Trigger) {
				$$renderer.push('<!--[-->');

				NavigationMenuPrimitive.Trigger($$renderer, $.spread_props([
					{
						'data-slot': 'navigation-menu-trigger',
						class: cn(navigationMenuTriggerStyle(), "group", className)
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
								hugeicons: 'ArrowDown01Icon',
								phosphor: 'CaretDownIcon',
								remixicon: 'RiArrowDownSLine',
								class: 'cn-navigation-menu-trigger-icon',
								'aria-hidden': 'true'
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