import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils.js";

export default function Field_legend($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			variant = "legend",
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		$$renderer.push(`<legend${$.attributes({
			'data-slot': 'field-legend',
			'data-variant': variant,
			class: $.clsx(cn("cn-field-legend", className)),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></legend>`);
		$.bind_props($$props, { ref });
	});
}