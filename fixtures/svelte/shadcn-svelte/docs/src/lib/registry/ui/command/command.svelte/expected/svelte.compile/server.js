import * as $ from 'svelte/internal/server';
import { Command as CommandPrimitive } from "bits-ui";
import { cn } from "$lib/utils.js";

export default function Command($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			api = null,
			ref = null,
			value = "",
			class: className,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (CommandPrimitive.Root) {
				$$renderer.push('<!--[-->');

				CommandPrimitive.Root($$renderer, $.spread_props([
					{
						'data-slot': 'command',
						class: cn("cn-command flex size-full flex-col overflow-hidden", className)
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
		$.bind_props($$props, { api, ref, value });
	});
}