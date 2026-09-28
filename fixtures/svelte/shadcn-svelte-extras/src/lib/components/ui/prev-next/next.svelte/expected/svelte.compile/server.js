import * as $ from 'svelte/internal/server';
import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
import { cn } from '$lib/utils.js';
import Button from '$lib/components/button.svelte';

export default function Next($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children, class: className, $$slots, $$events, ...rest } = $$props;

		Button($$renderer, $.spread_props([
			{
				class: cn('flex place-items-center gap-2 pr-2 pl-4', className),
				variant: 'outline',
				size: 'sm'
			},
			rest,
			{
				children: ($$renderer) => {
					children($$renderer);
					$$renderer.push(`<!----> `);
					ChevronRightIcon($$renderer, { class: 'size-4' });
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			}
		]));
	});
}