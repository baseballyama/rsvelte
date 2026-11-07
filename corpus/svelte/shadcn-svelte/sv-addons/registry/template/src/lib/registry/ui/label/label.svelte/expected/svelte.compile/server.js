import * as $ from 'svelte/internal/server';
import { Label as LabelPrimitive } from "bits-ui";
import { cn } from "$lib/utils.js";

export default function Label($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		if (LabelPrimitive.Root) {
			$$renderer.push('<!--[-->');

			LabelPrimitive.Root($$renderer, $.spread_props([
				{
					'data-slot': 'label',
					class: cn("flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50", className)
				},
				restProps
			]));

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$.bind_props($$props, { ref });
	});
}