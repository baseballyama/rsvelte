import * as $ from 'svelte/internal/server';
import ChevronLeftIcon from '@lucide/svelte/icons/chevron-left';
import { cn } from '$lib/utils.js';
import Button from '$lib/components/button.svelte';

export default function Previous($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children, class: className, $$slots, $$events, ...rest } = $$props;

		Button($$renderer, $.spread_props([
			{
				class: cn('flex place-items-center gap-2 pr-4 pl-2', className),
				variant: 'outline',
				size: 'sm'
			},
			rest,
			{
				children: ($$renderer) => {
					ChevronLeftIcon($$renderer, { class: 'size-4' });
					$$renderer.push(`<!----> `);
					children($$renderer);
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			}
		]));
	});
}