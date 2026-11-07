import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils.js';
import { PaginationLink } from './index.js';
import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';

export default function Pagination_next($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { class: className, $$slots, $$events, ...restProps } = $$props;

		PaginationLink($$renderer, $.spread_props([
			{
				'aria-label': 'Go to next page',
				size: 'default',
				class: cn('pr-2!', className)
			},
			restProps,
			{
				children: ($$renderer) => {
					$$renderer.push(`<span class="cn-pagination-next-text hidden sm:block">Next</span> `);
					ChevronRightIcon($$renderer, { 'data-icon': 'inline-end' });
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			}
		]));
	});
}