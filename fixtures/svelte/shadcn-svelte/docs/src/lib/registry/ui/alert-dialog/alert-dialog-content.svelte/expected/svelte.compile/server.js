import * as $ from 'svelte/internal/server';
import { AlertDialog as AlertDialogPrimitive } from "bits-ui";
import { cn } from "$lib/utils.js";
import AlertDialogOverlay from "./alert-dialog-overlay.svelte";
import AlertDialogPortal from "./alert-dialog-portal.svelte";

export default function Alert_dialog_content($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			size = "default",
			portalProps,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			AlertDialogPortal($$renderer, $.spread_props([
				portalProps,
				{
					children: ($$renderer) => {
						AlertDialogOverlay($$renderer, {});
						$$renderer.push(`<!----> `);

						if (AlertDialogPrimitive.Content) {
							$$renderer.push('<!--[-->');

							AlertDialogPrimitive.Content($$renderer, $.spread_props([
								{
									'data-slot': 'alert-dialog-content',
									'data-size': size,
									class: cn("cn-alert-dialog-content group/alert-dialog-content fixed top-1/2 left-1/2 z-50 grid w-full -translate-x-1/2 -translate-y-1/2 outline-none", className)
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