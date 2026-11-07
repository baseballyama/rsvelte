import * as $ from 'svelte/internal/server';
import { Switch as SwitchPrimitive } from 'bits-ui';
import { cn } from '$lib/utils.js';

export default function Switch($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			checked = false,
			size = 'default',
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (SwitchPrimitive.Root) {
				$$renderer.push('<!--[-->');

				SwitchPrimitive.Root($$renderer, $.spread_props([
					{
						'data-slot': 'switch',
						'data-size': size,
						class: cn('data-checked:bg-primary data-unchecked:bg-input focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 dark:data-unchecked:bg-input/80 peer group/switch relative inline-flex shrink-0 items-center rounded-full border border-transparent shadow-xs transition-all outline-none after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:ring-3 aria-invalid:ring-3 data-disabled:cursor-not-allowed data-disabled:opacity-50 data-[size=default]:h-[18.4px] data-[size=default]:w-[32px] data-[size=sm]:h-[14px] data-[size=sm]:w-[24px]', className)
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

						get checked() {
							return checked;
						},

						set checked($$value) {
							checked = $$value;
							$$settled = false;
						},

						children: ($$renderer) => {
							if (SwitchPrimitive.Thumb) {
								$$renderer.push('<!--[-->');

								SwitchPrimitive.Thumb($$renderer, {
									'data-slot': 'switch-thumb',
									class: 'bg-background dark:data-unchecked:bg-foreground dark:data-checked:bg-primary-foreground pointer-events-none block rounded-full ring-0 transition-transform group-data-[size=default]/switch:size-4 group-data-[size=sm]/switch:size-3 group-data-[size=default]/switch:data-checked:translate-x-[calc(100%-2px)] group-data-[size=sm]/switch:data-checked:translate-x-[calc(100%-2px)] group-data-[size=default]/switch:data-unchecked:translate-x-0 group-data-[size=sm]/switch:data-unchecked:translate-x-0 rtl:data-[state=checked]:translate-x-[calc(-100%)]'
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
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
		$.bind_props($$props, { ref, checked });
	});
}