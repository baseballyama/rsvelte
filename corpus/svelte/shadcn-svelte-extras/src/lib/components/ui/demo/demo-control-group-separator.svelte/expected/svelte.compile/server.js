import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils.js';
import * as Separator from '$lib/components/ui/separator';

export default function Demo_control_group_separator($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { class: className, $$slots, $$events, ...rest } = $$props;

		if (Separator.Root) {
			$$renderer.push('<!--[-->');

			Separator.Root($$renderer, $.spread_props([
				{
					orientation: 'vertical',
					class: cn('data-[orientation=vertical]:h-4', className)
				},
				rest
			]));

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}
	});
}