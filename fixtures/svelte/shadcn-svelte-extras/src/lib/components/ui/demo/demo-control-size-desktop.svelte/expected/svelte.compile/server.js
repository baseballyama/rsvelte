import * as $ from 'svelte/internal/server';
import * as ToggleGroup from '$lib/components/ui/toggle-group';
import MonitorIcon from '@lucide/svelte/icons/monitor';
import { cn } from '$lib/utils.js';
import { controlVariants } from './index.js';

export default function Demo_control_size_desktop($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			value = 100,
			class: className,
			$$slots,
			$$events,
			...rest
		} = $$props;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (ToggleGroup.Item) {
				$$renderer.push('<!--[-->');

				ToggleGroup.Item($$renderer, $.spread_props([
					{
						'aria-label': 'Desktop',
						value: value.toString(),
						class: cn(controlVariants(), className)
					},
					rest,
					{
						get ref() {
							return ref;
						},

						set ref($$value) {
							ref = $$value;
							$$settled = false;
						},

						children: ($$renderer) => {
							MonitorIcon($$renderer, {});
						},
						$$slots: { default: true }
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
		$.bind_props($$props, { ref });
	});
}