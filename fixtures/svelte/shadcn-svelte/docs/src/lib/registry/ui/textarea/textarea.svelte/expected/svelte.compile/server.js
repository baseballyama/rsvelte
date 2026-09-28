import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils.js";

export default function Textarea($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			value = void 0,
			class: className,
			"data-slot": dataSlot = "textarea",
			$$slots,
			$$events,
			...restProps
		} = $$props;

		$$renderer.push(`<textarea${$.attributes({
			'data-slot': dataSlot,
			class: $.clsx(cn("cn-textarea flex field-sizing-content min-h-16 w-full outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50", className)),
			...restProps
		})}>`);

		const $$body = $.escape(value);

		if ($$body) {
			$$renderer.push(`${$$body}`);
		} else {}

		$$renderer.push(`</textarea>`);
		$.bind_props($$props, { ref, value });
	});
}