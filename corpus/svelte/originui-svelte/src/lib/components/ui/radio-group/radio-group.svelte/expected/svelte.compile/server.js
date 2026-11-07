import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils.js';
import { RadioGroup as RadioGroupPrimitive } from 'bits-ui';

export const RadioGroupItem = RadioGroupPrimitive.Item;

export default function Radio_group($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			children,
			class: className,
			ref = null,
			value = undefined,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (RadioGroupPrimitive.Root) {
				$$renderer.push('<!--[-->');

				RadioGroupPrimitive.Root($$renderer, $.spread_props([
					{ class: cn('grid gap-3', className) },
					restProps,
					{
						get ref() {
							return ref;
						},

						set ref($$value) {
							ref = $$value;
							$$settled = false;
						},

						get value() {
							return value;
						},

						set value($$value) {
							value = $$value;
							$$settled = false;
						},

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