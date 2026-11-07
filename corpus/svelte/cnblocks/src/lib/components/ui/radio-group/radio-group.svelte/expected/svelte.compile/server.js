import * as $ from 'svelte/internal/server';
import { RadioGroup as RadioGroupPrimitive } from "bits-ui";
import { cn } from "$lib/utils.js";

export default function Radio_group($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			value = void 0,
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
					{ class: cn("grid gap-2", className) },
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