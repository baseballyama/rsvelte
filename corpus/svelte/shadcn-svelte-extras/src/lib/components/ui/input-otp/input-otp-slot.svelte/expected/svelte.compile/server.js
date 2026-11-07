import * as $ from 'svelte/internal/server';
import { PinInput as InputOTPPrimitive } from 'bits-ui';
import { cn } from '$lib/utils.js';

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
						'data-slot': 'input-otp-slot',
						class: cn('dark:bg-input/30 border-input data-[active=true]:border-ring data-[active=true]:ring-ring/50 data-[active=true]:aria-invalid:ring-destructive/20 dark:data-[active=true]:aria-invalid:ring-destructive/40 aria-invalid:border-destructive data-[active=true]:aria-invalid:border-destructive relative flex size-9 items-center justify-center border-y border-r text-sm shadow-xs transition-all outline-none first:rounded-l-md first:border-l last:rounded-r-md data-[active=true]:z-10 data-[active=true]:ring-3', className)
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
								$$renderer.push(`<!--[0--><div class="cn-input-otp-caret pointer-events-none absolute inset-0 flex items-center justify-center"><div class="animate-caret-blink bg-foreground bg-foreground h-4 w-px duration-1000"></div></div>`);
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