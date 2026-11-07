import * as $ from 'svelte/internal/server';
import { Button } from '$lib/components/ui/button/index.js';
import { cn } from '$lib/utils.ts';
import { PanelLeft } from 'lucide-svelte';
import { useSidebar } from './context.svelte.js';

export default function Sidebar_trigger($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			onclick,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const sidebar = useSidebar();

		Button($$renderer, $.spread_props([
			{
				type: 'button',
				onclick: (e) => {
					onclick?.(e);
					sidebar.toggle();
				},
				'data-sidebar': 'trigger',
				variant: 'ghost',
				size: 'icon',
				class: cn('h-7 w-7', className)
			},
			restProps,
			{
				children: ($$renderer) => {
					PanelLeft($$renderer, {});
					$$renderer.push(`<!----> <span class="sr-only">Toggle Sidebar</span>`);
				},
				$$slots: { default: true }
			}
		]));

		$.bind_props($$props, { ref });
	});
}