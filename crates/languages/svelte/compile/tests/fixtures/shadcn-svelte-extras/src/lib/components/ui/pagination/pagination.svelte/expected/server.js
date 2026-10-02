import * as $ from 'svelte/internal/server';
import { Pagination as PaginationPrimitive } from 'bits-ui';
import { cn } from '$lib/utils.js';

export default function Pagination($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			count = 0,
			perPage = 10,
			page = 1,
			siblingCount = 1,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (PaginationPrimitive.Root) {
				$$renderer.push('<!--[-->');

				PaginationPrimitive.Root($$renderer, $.spread_props([
					{
						role: 'navigation',
						'aria-label': 'pagination',
						'data-slot': 'pagination',
						count,
						perPage,
						siblingCount,
						class: cn('cn-pagination mx-auto flex w-full justify-center', className)
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

						get page() {
							return page;
						},

						set page($$value) {
							page = $$value;
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
		$.bind_props($$props, { ref, page });
	});
}