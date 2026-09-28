import * as $ from 'svelte/internal/server';
import { AlertDialog as AlertDialogPrimitive } from 'bits-ui';
import { cn } from '$lib/utils.js';

export default function Alert_dialog_title($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			class: className,
			level = 3,
			ref = null,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (AlertDialogPrimitive.Title) {
				$$renderer.push('<!--[-->');

				AlertDialogPrimitive.Title($$renderer, $.spread_props([
					{ class: cn('text-lg font-semibold', className), level },
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