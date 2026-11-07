import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils.js';
import { PaginationLink } from './index.js';
import ChevronLeftIcon from '@lucide/svelte/icons/chevron-left';

export default function Pagination_previous($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { class: className, $$slots, $$events, ...restProps } = $$props;

		PaginationLink($$renderer, $.spread_props([
			{
				'aria-label': 'Go to previous page',
				size: 'default',
				class: cn('pl-2!', className)
			},
			restProps,
			{
				children: ($$renderer) => {
					ChevronLeftIcon($$renderer, { 'data-icon': 'inline-start' });
					$$renderer.push(`<!----> <span class="cn-pagination-previous-text hidden sm:block">Previous</span>`);
				},
				$$slots: { default: true }
			}
		]));
	});
}