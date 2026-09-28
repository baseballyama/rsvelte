import * as $ from 'svelte/internal/server';
import * as FormPrimitive from 'formsnap';
import { cn } from '$lib/core/utils';

export default function Form_legend($$renderer, $$props) {
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
			if (FormPrimitive.Legend) {
				$$renderer.push('<!--[-->');

				FormPrimitive.Legend($$renderer, $.spread_props([
					restProps,
					{
						class: cn('text-sm font-medium leading-none data-[fs-error]:text-destructive', className),
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