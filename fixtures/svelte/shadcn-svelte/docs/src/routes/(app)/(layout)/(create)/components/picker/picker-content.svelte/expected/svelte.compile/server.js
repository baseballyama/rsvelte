import * as $ from 'svelte/internal/server';
import { DropdownMenu as DropdownMenuPrimitive } from "bits-ui";
import { cn } from "$lib/utils.js";

export default function Picker_content($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			sideOffset = 20,
			portalProps,
			class: className,
			submenu = false,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (submenu) {
				$$renderer.push('<!--[0-->');

				if (DropdownMenuPrimitive.SubContent) {
					$$renderer.push('<!--[-->');

					DropdownMenuPrimitive.SubContent($$renderer, $.spread_props([
						{
							'data-slot': 'dropdown-menu-sub-content',
							sideOffset,
							class: cn("z-50 w-auto min-w-[96px] rounded-md bg-popover/90 p-1 text-popover-foreground shadow-lg ring-1 ring-foreground/10 backdrop-blur-xs", className)
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
			} else {
				$$renderer.push('<!--[-1-->');

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
											'data-slot': 'dropdown-menu-content',
											sideOffset,
											class: cn("cn-menu-target z-50 no-scrollbar max-h-(--available-height) w-[calc(var(--available-width)-(--spacing(6)))] min-w-32 origin-(--transform-origin) translate-y-2 overflow-x-hidden overflow-y-auto rounded-xl border-0 bg-neutral-950 p-1.5 text-neutral-100 ring-1 ring-neutral-950/80 outline-none data-[state=closed]:overflow-hidden md:w-52 dark:bg-neutral-800 dark:ring-neutral-700/50 [&.cn-menu-translucent]:bg-neutral-950/80 [&.cn-menu-translucent]:backdrop-blur-xl dark:[&.cn-menu-translucent]:bg-neutral-800/90", className)
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

			$$renderer.push(`<!--]-->`);
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