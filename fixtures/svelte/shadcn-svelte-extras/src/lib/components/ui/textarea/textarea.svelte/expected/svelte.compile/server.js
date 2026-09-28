import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils.js';

export default function Textarea($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			value = void 0,
			class: className,
			'data-slot': dataSlot = 'textarea',
			$$slots,
			$$events,
			...restProps
		} = $$props;

		$$renderer.push(`<textarea${$.attributes({
			'data-slot': dataSlot,
			class: $.clsx(cn('border-input dark:bg-input/30 focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 placeholder:text-muted-foreground flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-2.5 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-3 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-3 md:text-sm', className)),
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