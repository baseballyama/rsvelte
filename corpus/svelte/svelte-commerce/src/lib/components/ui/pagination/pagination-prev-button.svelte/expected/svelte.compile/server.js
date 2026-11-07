import * as $ from 'svelte/internal/server';
import { Pagination as PaginationPrimitive } from 'bits-ui';
import { ChevronLeft } from '@lucide/svelte';
import { cn } from '$lib/core/utils';
import { buttonVariants } from '$lib/components/ui/button/index.js';

function Fallback($$renderer) {
	ChevronLeft($$renderer, { class: 'size-4' });
	$$renderer.push(`<!----> <span>Previous</span>`);
}

export default function Pagination_prev_button($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (PaginationPrimitive.PrevButton) {
				$$renderer.push('<!--[-->');

				PaginationPrimitive.PrevButton($$renderer, $.spread_props([
					restProps,
					{
						class: cn(buttonVariants({ variant: 'ghost', className: 'gap-1 pl-2.5' }), className),
						children: children || Fallback,
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