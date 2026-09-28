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
			$$slots,
			$$events,
			...restProps
		} = $$props;

		if (type === "file") {
			$$renderer.push(`<!--[0--><input${$.attributes(
				{
					class: $.clsx(cn("flex h-8 w-full min-w-0 rounded-md border border-input bg-card px-3 py-1 text-sm outline-none not-dark:bg-card selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm", "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/15", "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40", className)),
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
					class: $.clsx(cn("flex h-8 w-full min-w-0 rounded-md border border-input bg-card px-3 py-1 text-sm outline-none not-dark:bg-card selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm", "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/15", "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40", className)),
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