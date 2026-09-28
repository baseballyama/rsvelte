import * as $ from 'svelte/internal/server';
import { Pagination as PaginationPrimitive } from 'bits-ui';
import { buttonVariants } from '$lib/components/ui/button/index.js';
import { cn } from '$lib/core/utils';

export default function Pagination_link($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			size = 'icon',
			isActive = false,
			page,
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		function Fallback($$renderer) {
			$$renderer.push(`<!---->${$.escape(page.value)}`);
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (PaginationPrimitive.Page) {
				$$renderer.push('<!--[-->');

				PaginationPrimitive.Page($$renderer, $.spread_props([
					{
						page,
						'aria-current': isActive ? 'page' : undefined,
						class: cn(buttonVariants({ variant: isActive ? 'default' : 'ghost', size }), className)
					},
					restProps,
					{
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