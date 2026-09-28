import * as $ from 'svelte/internal/server';
import { Pagination as PaginationPrimitive } from 'bits-ui';
import { cn } from '$lib/core/utils';

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
						class: cn('mx-auto flex w-full flex-col items-center', className),
						count,
						perPage,
						siblingCount
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