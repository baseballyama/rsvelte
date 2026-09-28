import * as $ from 'svelte/internal/server';
import { PinInput as InputOTPPrimitive } from 'bits-ui';
import { cn } from '$lib/core/utils';

export default function Input_otp_slot($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			cell,
			class: className,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (InputOTPPrimitive.Cell) {
				$$renderer.push('<!--[-->');

				InputOTPPrimitive.Cell($$renderer, $.spread_props([
					{
						cell,
						class: cn('relative flex h-9 w-9 items-center justify-center border-y border-r border-input text-sm shadow-sm transition-all first:rounded-l-md first:border-l last:rounded-r-md', cell.isActive && 'z-10 ring-1 ring-ring', className)
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
							$$renderer.push(`<!---->${$.escape(cell.char)} `);

							if (cell.hasFakeCaret) {
								$$renderer.push(`<!--[0--><div class="pointer-events-none absolute inset-0 flex items-center justify-center"><div class="h-4 w-px animate-caret-blink bg-foreground duration-1000"></div></div>`);
							} else {
								$$renderer.push('<!--[-1-->');
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