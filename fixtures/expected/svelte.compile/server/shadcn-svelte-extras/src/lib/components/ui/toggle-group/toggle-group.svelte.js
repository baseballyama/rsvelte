import * as $ from 'svelte/internal/server';
import { ToggleGroup as ToggleGroupPrimitive } from 'bits-ui';
import { cn } from '$lib/utils.js';
import { getContext, setContext } from 'svelte';
import { toggleVariants } from '$lib/components/ui/toggle/index.js';

export function setToggleGroupCtx(props) {
	setContext('toggleGroup', props);
}

export function getToggleGroupCtx() {
	return getContext('toggleGroup');
}

export default function Toggle_group($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			value = void 0,
			class: className,
			size = 'default',
			spacing = 0,
			orientation = 'horizontal',
			variant = 'default',
			$$slots,
			$$events,
			...restProps
		} = $$props;

		setToggleGroupCtx({
			get variant() {
				return variant;
			},

			get size() {
				return size;
			},

			get spacing() {
				return spacing;
			},

			get orientation() {
				return orientation;
			}
		});

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (ToggleGroupPrimitive.Root) {
				$$renderer.push('<!--[-->');

				ToggleGroupPrimitive.Root($$renderer, $.spread_props([
					{
						orientation,
						'data-slot': 'toggle-group',
						'data-variant': variant,
						'data-size': size,
						'data-spacing': spacing,
						style: `--gap: ${spacing}`,
						class: cn('group/toggle-group flex w-fit flex-row items-center gap-[--spacing(var(--gap))] rounded-md data-vertical:flex-col data-vertical:items-stretch data-[spacing=0]:data-[variant=outline]:shadow-xs', className)
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