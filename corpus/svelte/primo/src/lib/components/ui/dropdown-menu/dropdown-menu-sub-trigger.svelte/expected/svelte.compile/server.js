import * as $ from 'svelte/internal/server';
import { DropdownMenu as DropdownMenuPrimitive } from 'bits-ui';
import ChevronRight from 'lucide-svelte/icons/chevron-right';
import { cn } from '$lib/utils.ts';

export default function Dropdown_menu_sub_trigger($$renderer, $$props) {
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
			if (DropdownMenuPrimitive.SubTrigger) {
				$$renderer.push('<!--[-->');

				DropdownMenuPrimitive.SubTrigger($$renderer, $.spread_props([
					{
						class: cn('data-highlighted:bg-accent data-[state=open]:bg-accent flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0', inset && 'pl-8', className)
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
							ChevronRight($$renderer, { class: 'ml-auto' });
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