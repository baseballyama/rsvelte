import * as $ from 'svelte/internal/server';
import { AlertDialog as AlertDialogPrimitive } from 'bits-ui';
import AlertDialogOverlay from './alert-dialog-overlay.svelte';
import { cn } from '$lib/utils.js';

export default function Alert_dialog_content($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			portalProps,
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
										class: cn('bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed left-[50%] top-[50%] z-[1001] grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border p-6 shadow-lg duration-200 sm:rounded-lg', className)
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