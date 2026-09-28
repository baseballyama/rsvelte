import * as $ from 'svelte/internal/server';
import { Dialog as SheetPrimitive } from "bits-ui";
import XIcon from "@lucide/svelte/icons/x";
import SheetPortal from "./sheet-portal.svelte";
import SheetOverlay from "./sheet-overlay.svelte";
import { cn } from "$lib/utils.js";
import { tv } from "tailwind-variants";

export const sheetVariants = tv({
	base: "fixed z-50 flex flex-col gap-4 bg-background shadow-lg transition ease-in-out data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:animate-in data-[state=open]:duration-500",
	variants: {
		side: {
			top: "inset-x-0 top-0 h-auto border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
			bottom: "inset-x-0 bottom-0 h-auto border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
			left: "inset-y-0 start-0 h-full w-3/4 border-e data-[state=closed]:slide-out-to-start data-[state=open]:slide-in-from-start sm:max-w-sm",
			right: "inset-y-0 end-0 h-full w-3/4 border-s data-[state=closed]:slide-out-to-end data-[state=open]:slide-in-from-end sm:max-w-sm"
		}
	},
	defaultVariants: { side: "right" }
});

export default function Sheet_content($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			side = "right",
			portalProps,
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			SheetPortal($$renderer, $.spread_props([
				portalProps,
				{
					children: ($$renderer) => {
						SheetOverlay($$renderer, {});
						$$renderer.push(`<!----> `);

						if (SheetPrimitive.Content) {
							$$renderer.push('<!--[-->');

							SheetPrimitive.Content($$renderer, $.spread_props([
								{
									'data-slot': 'sheet-content',
									class: cn(sheetVariants({ side }), className)
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

										if (SheetPrimitive.Close) {
											$$renderer.push('<!--[-->');

											SheetPrimitive.Close($$renderer, {
												class: 'absolute end-4 top-4 rounded-xs opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-hidden disabled:pointer-events-none',
												children: ($$renderer) => {
													XIcon($$renderer, { class: 'size-4' });
													$$renderer.push(`<!----> <span class="sr-only">Close</span>`);
												},
												$$slots: { default: true }
											});

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
					},
					$$slots: { default: true }
				}
			]));
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