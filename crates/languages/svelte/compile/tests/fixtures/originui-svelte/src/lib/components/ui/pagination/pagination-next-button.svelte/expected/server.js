import * as $ from 'svelte/internal/server';
import PaginationLink from './pagination-link.svelte';
import { cn } from '$lib/utils.js';
import ChevronRight from '@lucide/svelte/icons/chevron-right';

export default function Pagination_next_button($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			class: className,
			ref = null,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			PaginationLink($$renderer, $.spread_props([
				{
					'aria-label': 'Go to next page',
					size: 'default',
					class: cn('gap-1 pr-2.5', className)
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

					children: ($$renderer) => {
						$$renderer.push(`<span>Next</span> `);
						ChevronRight($$renderer, { size: 16 });
						$$renderer.push(`<!---->`);
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