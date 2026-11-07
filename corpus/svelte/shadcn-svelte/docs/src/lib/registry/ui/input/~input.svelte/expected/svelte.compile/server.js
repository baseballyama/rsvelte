import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils.js";

export default function Input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			value = void 0,
			type,
			files = void 0,
			class: className,
			"data-slot": dataSlot = "input",
			$$slots,
			$$events,
			...restProps
		} = $$props;

		if (type === "file") {
			$$renderer.push(`<!--[0--><input${$.attributes(
				{
					'data-slot': dataSlot,
					class: $.clsx(cn("cn-input w-full min-w-0 outline-none file:inline-flex file:border-0 file:bg-transparent file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50", className)),
					type: 'file',
					...restProps
				},
				void 0,
				void 0,
				void 0,
				4
			)}/>`);
		} else {
			$$renderer.push(`<!--[-1--><input${$.attributes(
				{
					'data-slot': dataSlot,
					class: $.clsx(cn("cn-input w-full min-w-0 outline-none file:inline-flex file:border-0 file:bg-transparent file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50", className)),
					type,
					value,
					...restProps
				},
				void 0,
				void 0,
				void 0,
				4
			)}/>`);
		}

		$$renderer.push(`<!--]-->`);
		$.bind_props($$props, { ref, value, files });
	});
}