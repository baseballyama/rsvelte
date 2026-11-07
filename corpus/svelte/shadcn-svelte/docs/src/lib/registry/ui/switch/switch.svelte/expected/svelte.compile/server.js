import * as $ from 'svelte/internal/server';
import { Switch as SwitchPrimitive } from "bits-ui";
import { cn } from "$lib/utils.js";

export default function Switch($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			checked = false,
			size = "default",
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
						class: cn("cn-switch peer group/switch relative inline-flex items-center transition-all outline-none after:absolute after:-inset-x-3 after:-inset-y-2 data-disabled:cursor-not-allowed data-disabled:opacity-50", className)
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
									class: 'cn-switch-thumb pointer-events-none block ring-0 transition-transform rtl:data-[state=checked]:translate-x-[calc(-100%)]'
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