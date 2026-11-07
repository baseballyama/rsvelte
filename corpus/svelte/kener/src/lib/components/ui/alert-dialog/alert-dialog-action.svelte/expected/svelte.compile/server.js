import * as $ from 'svelte/internal/server';
import { AlertDialog as AlertDialogPrimitive } from "bits-ui";
import { buttonVariants } from "$lib/components/ui/button/index.js";
import { cn } from "$lib/utils.js";

export default function Alert_dialog_action($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (AlertDialogPrimitive.Action) {
				$$renderer.push('<!--[-->');

				AlertDialogPrimitive.Action($$renderer, $.spread_props([
					{
						'data-slot': 'alert-dialog-action',
						class: cn(buttonVariants(), className)
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