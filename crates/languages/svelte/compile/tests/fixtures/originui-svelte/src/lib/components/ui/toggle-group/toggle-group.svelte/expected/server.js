import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils.js';
import { ToggleGroup as ToggleGroupPrimitive } from 'bits-ui';
import { getContext, setContext } from 'svelte';

export function setToggleGroupCtx(props) {
	setContext('toggleGroup', props);
}

export function getToggleGroupCtx() {
	return getContext('toggleGroup');
}

export default function Toggle_group($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			class: className,
			ref = null,
			size = 'default',
			value = void 0,
			variant = 'default',
			$$slots,
			$$events,
			...restProps
		} = $$props;

		setToggleGroupCtx({ size, variant });

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (ToggleGroupPrimitive.Root) {
				$$renderer.push('<!--[-->');

				ToggleGroupPrimitive.Root($$renderer, $.spread_props([
					{
						class: cn('group/toggle-group flex items-center rounded-md data-[variant=outline]:shadow-2xs', className)
					},
					restProps,
					{
						get value() {
							return value;
						},

						set value($$value) {
							value = $$value;
							$$settled = false;
						},

						get ref() {
							return ref;
						},

						set ref($$value) {
							ref = $$value;
							$$settled = false;
						}
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
		$.bind_props($$props, { ref, value });
	});
}