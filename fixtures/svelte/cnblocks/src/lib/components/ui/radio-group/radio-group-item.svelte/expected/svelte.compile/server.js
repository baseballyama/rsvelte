import * as $ from 'svelte/internal/server';
import { RadioGroup as RadioGroupPrimitive } from "bits-ui";
import Circle from "@lucide/svelte/icons/circle";
import { cn } from "$lib/utils.js";

export default function Radio_group_item($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			{
				function children($$renderer, { checked }) {
					$$renderer.push(`<div class="flex items-center justify-center">`);

					if (checked) {
						$$renderer.push('<!--[0-->');
						Circle($$renderer, { class: 'size-3.5 fill-primary' });
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></div>`);
				}

				if (RadioGroupPrimitive.Item) {
					$$renderer.push('<!--[-->');

					RadioGroupPrimitive.Item($$renderer, $.spread_props([
						{
							class: cn("aspect-square size-4 rounded-full border border-primary text-primary shadow focus:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50", className)
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
							children,
							$$slots: { default: true }
						}
					]));

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
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