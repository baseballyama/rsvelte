import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils.js';
import * as ToggleGroup from '$lib/components/ui/toggle-group';
import { useDemoControlGroup } from './demo.svelte.js';
import { box } from 'svelte-toolbelt';

export default function Demo_control_group($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			// this is just here to satisfy the types
			type = 'single',
			class: className,
			children,
			$$slots,
			$$events,
			...rest
		} = $$props;

		let value = 100;
		const controlGroupState = useDemoControlGroup({ size: box.with(() => value, (v) => value = v) });

		if (ToggleGroup.Root) {
			$$renderer.push('<!--[-->');

			ToggleGroup.Root($$renderer, $.spread_props([
				{
					type,
					value: value.toString(),
					onValueChange: (value) => controlGroupState.onValueChange(parseInt(value)),
					class: cn('border-border hidden h-9 gap-0.5 rounded-md border p-0.5 md:flex', className)
				},
				rest,
				{
					children: ($$renderer) => {
						children?.($$renderer);
						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				}
			]));

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}
	});
}