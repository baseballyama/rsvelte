import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils.js";

export default function Field_set($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		$$renderer.push(`<fieldset${$.attributes({
			'data-slot': 'field-set',
			class: $.clsx(cn("cn-field-set flex flex-col", className)),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></fieldset>`);
		$.bind_props($$props, { ref });
	});
}