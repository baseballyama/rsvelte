import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils.js';
import { DropdownMenu as DropdownMenuPrimitive } from 'bits-ui';

export default function Dropdown_menu_content($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			class: className,
			onCloseAutoFocus,
			onPointerDown,
			onPointerDownOutside,
			portalProps,
			ref = null,
			sideOffset = 4,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let isCloseFromMouse = false;

		function handlePointerDown(e) {
			isCloseFromMouse = true;
			onPointerDown?.(e);
		}

		function handlePointerDownOutside(e) {
			isCloseFromMouse = true;
			onPointerDownOutside?.(e);
		}

		function handleCloseAutoFocus(e) {
			if (onCloseAutoFocus) {
				return onCloseAutoFocus(e);
			}

			if (!isCloseFromMouse) {
				return;
			}

			e.preventDefault();
			isCloseFromMouse = false;
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (DropdownMenuPrimitive.Portal) {
				$$renderer.push('<!--[-->');

				DropdownMenuPrimitive.Portal($$renderer, $.spread_props([
					portalProps,
					{
						children: ($$renderer) => {
							if (DropdownMenuPrimitive.Content) {
								$$renderer.push('<!--[-->');

								DropdownMenuPrimitive.Content($$renderer, $.spread_props([
									{
										sideOffset,
										class: cn('border-border bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 min-w-40 overflow-hidden rounded-lg border p-1 shadow-lg shadow-black/5 data-dropdown-menu-content:focus:outline-hidden', className),
										onpointerdown: handlePointerDown,
										onInteractOutside: handlePointerDownOutside,
										onCloseAutoFocus: handleCloseAutoFocus
									},
									restProps,
									{
										get ref() {
											return ref;
										},

										set ref($$value) {
											ref = $$value;
											$$settled = false;
										}
									}
								]));

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
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