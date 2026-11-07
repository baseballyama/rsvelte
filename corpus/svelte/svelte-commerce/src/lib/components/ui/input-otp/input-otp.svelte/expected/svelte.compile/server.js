import * as $ from 'svelte/internal/server';
import { PinInput as InputOTPPrimitive } from 'bits-ui';
import { cn } from '$lib/core/utils';

export default function Input_otp($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			value = '',
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (InputOTPPrimitive.Root) {
				$$renderer.push('<!--[-->');

				InputOTPPrimitive.Root($$renderer, $.spread_props([
					{
						class: cn('flex items-center gap-2 has-[:disabled]:opacity-50 [&_input]:disabled:cursor-not-allowed', className)
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

						get value() {
							return value;
						},

						set value($$value) {
							value = $$value;
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