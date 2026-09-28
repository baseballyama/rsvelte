import * as $ from 'svelte/internal/server';
import { Button } from '$lib/components/ui/button/index.js';
import PanelLeftIcon from '@lucide/svelte/icons/panel-left';
import { cn } from '$lib/utils.js';
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
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Button($$renderer, $.spread_props([
				{
					'data-sidebar': 'trigger',
					'data-slot': 'sidebar-trigger',
					variant: 'ghost',
					size: 'icon-sm',
					class: cn('cn-sidebar-trigger', className),
					type: 'button',
					onclick: (e) => {
						onclick?.(e);
						sidebar.toggle();
					}
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
						PanelLeftIcon($$renderer, {});
						$$renderer.push(`<!----> <span class="sr-only">Toggle Sidebar</span>`);
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