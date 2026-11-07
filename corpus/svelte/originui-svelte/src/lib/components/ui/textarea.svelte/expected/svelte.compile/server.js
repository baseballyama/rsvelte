import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils.js';

export default function Textarea($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			class: className,
			ref = null,
			value = void 0,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		$$renderer.push(`<textarea${$.attributes({
			class: $.clsx(cn('border-input placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive flex min-h-19.5 w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50', className)),
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