import * as $ from 'svelte/internal/server';
import { Select as SelectPrimitive } from 'bits-ui';
import { cn } from '$lib/utils.js';
import { buttonVariants } from '$lib/components/ui/button';
import { useSplitButtonRootCtx } from './split-button.svelte.js';
import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';

export default function Split_button_select_trigger($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			variant = 'default',
			size = 'icon',
			disabled,
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const root = useSplitButtonRootCtx();
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (SelectPrimitive.Trigger) {
				$$renderer.push('<!--[-->');

				SelectPrimitive.Trigger($$renderer, $.spread_props([
					{
						'data-slot': 'split-button-select-trigger',
						disabled: disabled || root.disabled,
						class: cn(buttonVariants({ variant, size }), className)
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
							if (children) {
								$$renderer.push('<!--[0-->');
								children($$renderer);
								$$renderer.push(`<!---->`);
							} else {
								$$renderer.push('<!--[-1-->');
								ChevronDownIcon($$renderer, {});
							}

							$$renderer.push(`<!--]-->`);
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