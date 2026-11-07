import * as $ from 'svelte/internal/server';
import AlertDialogOverlay from './alert-dialog-overlay.svelte';
import { cn } from '$lib/utils.js';
import { AlertDialog as AlertDialogPrimitive } from 'bits-ui';

export default function Alert_dialog_content($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			class: className,
			portalProps,
			ref = null,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (AlertDialogPrimitive.Portal) {
				$$renderer.push('<!--[-->');

				AlertDialogPrimitive.Portal($$renderer, $.spread_props([
					portalProps,
					{
						children: ($$renderer) => {
							AlertDialogOverlay($$renderer, {});
							$$renderer.push(`<!----> `);

							if (AlertDialogPrimitive.Content) {
								$$renderer.push('<!--[-->');

								AlertDialogPrimitive.Content($$renderer, $.spread_props([
									{
										class: cn('bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-1/2 left-1/2 z-50 grid max-h-[calc(100%-2rem)] w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-4 overflow-y-auto rounded-xl border p-6 shadow-lg duration-200 sm:max-w-100', className)
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