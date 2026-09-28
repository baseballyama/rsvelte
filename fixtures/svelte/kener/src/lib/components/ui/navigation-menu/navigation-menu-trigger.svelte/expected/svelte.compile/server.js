import * as $ from 'svelte/internal/server';
import { NavigationMenu as NavigationMenuPrimitive } from "bits-ui";
import ChevronDownIcon from "@lucide/svelte/icons/chevron-down";
import { cn } from "$lib/utils.js";
import { tv } from "tailwind-variants";

export const navigationMenuTriggerStyle = tv({
	base: "bg-background hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[state=open]:hover:bg-accent data-[state=open]:text-accent-foreground data-[state=open]:focus:bg-accent data-[state=open]:bg-accent/50 focus-visible:ring-ring/50 group inline-flex h-9 w-max items-center justify-center rounded-md px-2 py-2 text-sm font-medium transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50"
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

							ChevronDownIcon($$renderer, {
								class: 'relative top-[1px] ms-1 size-3 transition duration-300 group-data-[state=open]:rotate-180',
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