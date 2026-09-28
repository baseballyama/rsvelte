import * as $ from 'svelte/internal/server';
import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
import { NavigationMenu as NavigationMenuPrimitive } from 'bits-ui';
import { cn } from '$lib/utils';
import { tv } from 'tailwind-variants';

export const navigationMenuTriggerStyle = tv({
	base: 'group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=open]:hover:bg-accent data-[state=open]:text-accent-foreground data-[state=open]:focus:bg-accent data-[state=open]:bg-accent/50 focus-visible:ring-ring/50 outline-hidden transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1'
});

export default function Navigation_menu_trigger($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			children,
			class: className,
			ref = null,
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
						class: cn(navigationMenuTriggerStyle(), 'group', className)
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
								class: 'relative top-px ml-1 size-3 transition duration-300 group-data-[state=open]:rotate-180',
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