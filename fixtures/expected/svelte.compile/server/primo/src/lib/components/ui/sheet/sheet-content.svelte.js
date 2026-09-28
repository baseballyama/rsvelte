import * as $ from 'svelte/internal/server';
import { Dialog as SheetPrimitive } from 'bits-ui';
import SheetOverlay from './sheet-overlay.svelte';
import { cn } from '$lib/utils.ts';
import { tv } from 'tailwind-variants';

export const sheetVariants = tv({
	base: 'bg-background data-[state=open]:animate-in data-[state=closed]:animate-out fixed z-50 gap-4 p-6 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500',
	variants: {
		side: {
			top: 'data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top inset-x-0 top-0 border-b',
			bottom: 'data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom inset-x-0 bottom-0 border-t',
			left: 'data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm',
			right: 'data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm'
		}
	},
	defaultVariants: { side: 'right' }
});

export default function Sheet_content($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// import X from "lucide-svelte/icons/x";
		let {
			ref = null,
			class: className,
			portalProps,
			side = 'right',
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (SheetPrimitive.Portal) {
				$$renderer.push('<!--[-->');

				SheetPrimitive.Portal($$renderer, $.spread_props([
					portalProps,
					{
						children: ($$renderer) => {
							SheetOverlay($$renderer, {});
							$$renderer.push(`<!----> `);

							if (SheetPrimitive.Content) {
								$$renderer.push('<!--[-->');

								SheetPrimitive.Content($$renderer, $.spread_props([
									{ class: cn(sheetVariants({ side }), className) },
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
													class: 'ring-offset-background focus:ring-ring data-[state=open]:bg-secondary absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-hidden focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none',
													children: ($$renderer) => {
														$$renderer.push(`<span>X</span> <span class="sr-only">Close</span>`);
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