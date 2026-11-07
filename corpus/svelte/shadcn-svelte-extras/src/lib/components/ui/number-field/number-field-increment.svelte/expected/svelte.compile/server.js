import * as $ from 'svelte/internal/server';
import PlusIcon from '@lucide/svelte/icons/plus';
import Button from '$lib/components/button.svelte';
import { useNumberFieldButton } from './number-field.svelte.js';
import { cn } from '$lib/utils';
import { box } from 'svelte-toolbelt';
import { onDestroy } from 'svelte';

export default function Number_field_increment($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			variant = 'ghost',
			size = 'icon',
			class: className,
			children,
			disabled = false,
			onpointerdown,
			onpointerup,
			onpointerleave,
			onpointercancel,
			onclick,
			tabindex = -1,
			$$slots,
			$$events,
			...rest
		} = $$props;

		const buttonState = useNumberFieldButton({
			direction: 'up',
			onpointerdown: box.with(() => onpointerdown),
			onpointerup: box.with(() => onpointerup),
			onpointerleave: box.with(() => onpointerleave),
			onpointercancel: box.with(() => onpointercancel),
			onclick: box.with(() => onclick),
			disabled: box.with(() => disabled)
		});

		onDestroy(() => buttonState.destroy());

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Button($$renderer, $.spread_props([
				{
					variant,
					size,
					tabindex,
					'data-slot': 'number-field-increment',
					'aria-label': 'Increase',
					class: cn('touch-manipulation', className)
				},
				buttonState.props,
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
						if (children) {
							$$renderer.push('<!--[0-->');
							children?.($$renderer);
							$$renderer.push(`<!---->`);
						} else {
							$$renderer.push('<!--[-1-->');
							PlusIcon($$renderer, {});
						}

						$$renderer.push(`<!--]-->`);
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