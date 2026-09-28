import * as $ from 'svelte/internal/server';
import { Button } from "$lib/components/ui/button/index.js";
import { cn } from "$lib/utils.js";
import PanelLeftIcon from "@lucide/svelte/icons/panel-left";
import { useSidebar } from "./context.svelte.js";

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
				'data-sidebar': 'trigger',
				'data-slot': 'sidebar-trigger',
				variant: 'ghost',
				size: 'icon',
				class: cn("size-7", className),
				type: 'button',
				onclick: (e) => {
					onclick?.(e);
					sidebar.toggle();
				}
			},
			restProps,
			{
				children: ($$renderer) => {
					PanelLeftIcon($$renderer, {});
					$$renderer.push(`<!----> <span class="sr-only">Toggle Sidebar</span>`);
				},
				$$slots: { default: true }
			}
		]));

		$.bind_props($$props, { ref });
	});
}